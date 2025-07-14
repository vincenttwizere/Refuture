import express from 'express';
import Interview from '../models/Interview.js';
import User from '../models/UserModel.js';
import Profile from '../models/ProfileModel.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendInterviewInvitation } from '../utils/sendEmail.js';

const router = express.Router();

// POST /api/interviews/invite - Send interview invitation (provider only)
router.post('/invite', protect, async (req, res) => {
  try {
    console.log('Interview invite request body:', req.body);
    console.log('User making request:', req.user._id, req.user.role);
    
    const { 
      talentId, 
      type, 
      title, 
      description, 
      organization, 
      position, 
      location, 
      address, 
      scheduledDate, 
      duration, 
      providerNotes,
      format,
      meetingPlatform,
      customGoogleMeetLink,
      availabilitySlots,
      materials,
      instructions
    } = req.body;

    // Validate required fields
    if (!talentId || !type || !title || !description || !organization) {
      console.log('Missing required fields:', { talentId, type, title, description, organization });
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    // Check if talent exists and has a profile
    console.log('Looking for talent with ID:', talentId);
    const talent = await User.findById(talentId);
    console.log('Found talent:', talent ? { id: talent._id, role: talent.role, hasProfile: talent.hasProfile } : 'Not found');
    
    if (!talent || talent.role !== 'refugee') {
      console.log('Talent not found or not a refugee');
      return res.status(404).json({ 
        message: 'Talent not found' 
      });
    }

    if (!talent.hasProfile) {
      console.log('Talent has no profile');
      return res.status(400).json({ 
        message: 'Talent has not completed their profile' 
      });
    }

    // Check if interview already exists
    const existingInterview = await Interview.findOne({
      providerId: req.user._id,
      talentId: talentId,
      status: { $in: ['invited', 'confirmed'] }
    });

    if (existingInterview) {
      return res.status(400).json({ 
        message: 'Interview invitation already sent to this talent' 
      });
    }

    // Generate meeting link if video format
    let meetingLink = '';
    if (format === 'video' && meetingPlatform) {
      const tempInterview = new Interview({ 
        meetingPlatform,
        customGoogleMeetLink: meetingPlatform === 'google-meet' ? customGoogleMeetLink : null
      });
      meetingLink = tempInterview.generateMeetingLink();
    }

    // Create interview invitation
    console.log('Creating interview with data:', {
      providerId: req.user._id,
      talentId: talentId,
      type,
      title,
      description,
      organization,
      position,
      location,
      address,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      duration,
      providerNotes,
      format,
      meetingPlatform,
      customGoogleMeetLink,
      availabilitySlots,
      meetingLink,
      materials,
      instructions,
      status: 'invited'
    });
    
    const interview = new Interview({
      providerId: req.user._id,
      talentId: talentId,
      type,
      title,
      description,
      organization,
      position,
      location,
      address,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      duration,
      providerNotes,
      format,
      meetingPlatform,
      customGoogleMeetLink,
      availabilitySlots: availabilitySlots || [],
      meetingLink,
      materials,
      instructions,
      status: 'invited'
    });

    console.log('About to save interview...');
    await interview.save();
    console.log('Interview saved successfully:', interview._id);

    // Send email notification to the talent
    try {
      const interviewDate = scheduledDate ? new Date(scheduledDate).toLocaleDateString() : 'To be scheduled';
      const interviewTime = scheduledDate ? new Date(scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'To be scheduled';
      
      await sendInterviewInvitation(
        talent.email,
        talent.firstName,
        title,
        organization,
        interviewDate,
        interviewTime,
        location || address
      );
      console.log('Interview invitation email sent to:', talent.email);
    } catch (emailError) {
      console.error('Failed to send interview invitation email:', emailError);
      // Don't fail the interview creation if email fails
    }

    res.status(201).json({
      message: 'Interview invitation sent successfully',
      interview
    });

  } catch (error) {
    console.error('Send interview invitation error:', error);
    res.status(500).json({ 
      message: 'Error sending interview invitation',
      error: error.message 
    });
  }
});

// GET /api/interviews/provider - Get provider's sent invitations
router.get('/provider', protect, async (req, res) => {
  try {
    // Check if user is a provider or admin
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Provider role required.' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { providerId: req.user._id };
    if (status) {
      query.status = status;
    }

    const interviews = await Interview.find(query)
      .populate('talentId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interview.countDocuments(query);

    res.json({
      interviews,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + interviews.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get provider interviews error:', error);
    res.status(500).json({ 
      message: 'Error fetching interviews',
      error: error.message 
    });
  }
});

// GET /api/interviews/talent - Get talent's received invitations
router.get('/talent', protect, async (req, res) => {
  try {
    // Check if user is a refugee or admin
    if (req.user.role !== 'refugee' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Refugee role required.' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { talentId: req.user._id };
    if (status) {
      query.status = status;
    }

    const interviews = await Interview.find(query)
      .populate('providerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interview.countDocuments(query);

    res.json({
      interviews,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + interviews.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get talent interviews error:', error);
    res.status(500).json({ 
      message: 'Error fetching interviews',
      error: error.message 
    });
  }
});

// PUT /api/interviews/:id/respond - Talent responds to interview invitation
router.put('/:id/respond', protect, async (req, res) => {
  try {
    console.log('Respond to interview request body:', req.body);
    const { status, message, preferredTimes, selectedSlot } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Missing required field: status' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status !== 'invited') {
      return res.status(400).json({ 
        message: 'Interview has already been responded to' 
      });
    }

    // Defensive: If confirming, selectedSlot must be present and valid
    let selectedSlotData = null;
    if (status === 'confirmed') {
      if (!selectedSlot || !selectedSlot.date || !selectedSlot.startTime || !selectedSlot.endTime) {
        return res.status(400).json({ message: 'Missing or invalid selectedSlot for confirmation', selectedSlot });
      }
      selectedSlotData = {
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        duration: selectedSlot.duration || 60
      };
    }

    interview.status = status;
    interview.talentResponse = {
      message: message || '',
      respondedAt: new Date(),
      preferredTimes: preferredTimes || [],
      selectedSlot: selectedSlotData,
      availability: status === 'confirmed' ? 'available' : 'unavailable'
    };

    await interview.save();

    res.json({
      message: `Interview ${status} successfully`,
      interview
    });

  } catch (error) {
    console.error('Respond to interview error:', error, error.stack);
    res.status(500).json({ 
      message: 'Error responding to interview',
      error: error.message 
    });
  }
});

// PUT /api/interviews/:id/confirm - Confirm interview scheduling (provider only)
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const { confirmedDate, confirmedTime, meetingDetails, finalInstructions } = req.body;

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (interview.status !== 'confirmed') {
      return res.status(400).json({ 
        message: 'Interview must be confirmed by talent before scheduling' 
      });
    }

    // Update interview with confirmation details
    interview.status = 'scheduled';
    interview.scheduledDate = new Date(`${confirmedDate}T${confirmedTime}`);
    interview.confirmation = {
      confirmedDate: new Date(confirmedDate),
      confirmedTime,
      meetingDetails,
      finalInstructions,
      sentAt: new Date()
    };

    // Generate meeting link if video format and not already set
    if (interview.format === 'video' && !interview.meetingLink) {
      interview.meetingLink = interview.generateMeetingLink();
    }

    await interview.save();

    res.json({
      message: 'Interview scheduled successfully',
      interview
    });

  } catch (error) {
    console.error('Confirm interview error:', error);
    res.status(500).json({ 
      message: 'Error confirming interview',
      error: error.message 
    });
  }
});

// PUT /api/interviews/:id/complete - Mark interview as completed
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check if user is provider or talent for this interview
    if (interview.providerId.toString() !== req.user._id.toString() && 
        interview.talentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (interview.status !== 'scheduled') {
      return res.status(400).json({ 
        message: 'Only scheduled interviews can be marked as completed' 
      });
    }

    interview.status = 'completed';
    await interview.save();

    res.json({
      message: 'Interview marked as completed',
      interview
    });

  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ 
      message: 'Error completing interview',
      error: error.message 
    });
  }
});

// PUT /api/interviews/:id/remind - Send reminder for interview
router.put('/:id/remind', protect, async (req, res) => {
  try {
    const { reminderType } = req.body; // '24h', '1h', '15min'

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (interview.status !== 'scheduled') {
      return res.status(400).json({ 
        message: 'Only scheduled interviews can have reminders sent' 
      });
    }

    // Add reminder to interview
    interview.reminders.push({
      type: reminderType,
      sentAt: new Date(),
      scheduledFor: interview.scheduledDate
    });

    await interview.save();

    res.json({
      message: 'Reminder sent successfully',
      interview
    });

  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ 
      message: 'Error sending reminder',
      error: error.message 
    });
  }
});

// GET /api/interviews/:id - Get specific interview
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('providerId', 'firstName lastName email')
      .populate('talentId', 'firstName lastName email');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check if user can view this interview
    if (req.user.role !== 'admin' && 
        req.user._id.toString() !== interview.providerId._id.toString() &&
        req.user._id.toString() !== interview.talentId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ interview });

  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ 
      message: 'Error fetching interview',
      error: error.message 
    });
  }
});

// PUT /api/interviews/:id - Update interview (provider only)
router.put('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updates if interview is still pending
    if (interview.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update interview that has been responded to' 
      });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'scheduledDate', 'duration', 'providerNotes'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        interview[field] = req.body[field];
      }
    });

    await interview.save();

    res.json({
      message: 'Interview updated successfully',
      interview
    });

  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ 
      message: 'Error updating interview',
      error: error.message 
    });
  }
});

// PUT /api/interviews/:id/select-slot - Select availability slot (talent only)
router.put('/:id/select-slot', protect, async (req, res) => {
  try {
    const { slotIndex } = req.body;

    if (slotIndex === undefined || slotIndex < 0) {
      return res.status(400).json({ 
        message: 'Valid slot index is required' 
      });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.talentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (interview.status !== 'invited') {
      return res.status(400).json({ 
        message: 'Interview has already been responded to' 
      });
    }

    // Check if slot exists and is available
    if (!interview.availabilitySlots[slotIndex]) {
      return res.status(400).json({ 
        message: 'Invalid slot index' 
      });
    }

    if (!interview.availabilitySlots[slotIndex].isAvailable) {
      return res.status(400).json({ 
        message: 'Selected slot is not available' 
      });
    }

    // Select the slot
    const success = interview.selectSlot(slotIndex);
    if (!success) {
      return res.status(400).json({ 
        message: 'Failed to select slot' 
      });
    }

    // Update status to confirmed
    interview.status = 'confirmed';
    interview.talentResponse = {
      message: 'Slot selected from available options',
      respondedAt: new Date(),
      availability: 'available'
    };

    await interview.save();

    res.json({
      message: 'Slot selected successfully',
      interview
    });

  } catch (error) {
    console.error('Select slot error:', error);
    res.status(500).json({ 
      message: 'Error selecting slot',
      error: error.message 
    });
  }
});

// GET /api/interviews/:id/availability - Get available slots for interview
router.get('/:id/availability', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check if user can view this interview
    if (req.user._id.toString() !== interview.providerId.toString() &&
        req.user._id.toString() !== interview.talentId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const availableSlots = interview.getAvailableSlots();

    res.json({
      availableSlots,
      totalSlots: interview.availabilitySlots.length
    });

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ 
      message: 'Error fetching availability',
      error: error.message 
    });
  }
});

export default router; 