require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User      = require('./models/User');
const Event     = require('./models/Event');
const Quotation = require('./models/Quotation');
const AdRequest = require('./models/AdRequest');
const Campaign  = require('./models/Campaign');
const Ticket    = require('./models/Ticket');

const hash = async (pw) => bcrypt.hash(pw, 10);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  if (process.argv.includes('--clear')) {
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Quotation.deleteMany({}),
      AdRequest.deleteMany({}),
      Campaign.deleteMany({}),
      Ticket.deleteMany({}),
    ]);
    console.log('All collections cleared');
  }

  const pw = await hash('12345678');

  // ── COLLEGES ──────────────────────────────────────────────
  const colleges = await User.insertMany([
    {
      name: 'Meerut Institute of Engineering and Technology',
      email: 'admin@miet.ac.in',
      password: pw,
      role: 'college',
      collegeDetails: {
        address: 'NH-58, Delhi-Haridwar Bypass, Meerut, UP - 250005',
        domain: 'miet.ac.in',
        contactNumber: '0121-2439100',
        website: 'https://www.miet.ac.in',
      },
    },
    {
      name: 'Shobhit Institute of Engineering & Technology',
      email: 'admin@shobhituniversity.ac.in',
      password: pw,
      role: 'college',
      collegeDetails: {
        address: 'Modipuram, Meerut, UP - 250110',
        domain: 'shobhituniversity.ac.in',
        contactNumber: '0121-2575091',
        website: 'https://shobhituniversity.ac.in',
      },
    },
    {
      name: 'R.G. Degree College Meerut',
      email: 'admin@rgcollege.ac.in',
      password: pw,
      role: 'college',
      collegeDetails: {
        address: 'Civil Lines, Meerut, UP - 250001',
        domain: 'rgcollege.ac.in',
        contactNumber: '0121-2644800',
        website: 'https://rgcollege.ac.in',
      },
    },
    {
      name: 'Subharti University Meerut',
      email: 'admin@subharti.org',
      password: pw,
      role: 'college',
      collegeDetails: {
        address: 'Subhartipuram, Meerut, UP - 250005',
        domain: 'subharti.org',
        contactNumber: '0121-2439055',
        website: 'https://www.subharti.org',
      },
    },
    {
      name: 'IMS Engineering College Ghaziabad',
      email: 'admin@imsec.ac.in',
      password: pw,
      role: 'college',
      collegeDetails: {
        address: 'Adhyatmik Nagar, NH-58, Ghaziabad, UP - 201009',
        domain: 'imsec.ac.in',
        contactNumber: '0120-2675111',
        website: 'https://www.imsec.ac.in',
      },
    },
  ]);
  console.log(`Inserted ${colleges.length} colleges`);

  // ── STUDENTS ──────────────────────────────────────────────
  const students = await User.insertMany([
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@miet.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'MIET', officialEmail: 'aarav@miet.ac.in' },
    },
    {
      name: 'Priya Gupta',
      email: 'priya.gupta@miet.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'MIET', officialEmail: 'priya@miet.ac.in' },
    },
    {
      name: 'Rahul Tyagi',
      email: 'rahul.tyagi@shobhit.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'Shobhit University', officialEmail: 'rahul@shobhit.ac.in' },
    },
    {
      name: 'Neha Agarwal',
      email: 'neha.agarwal@shobhit.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'Shobhit University', officialEmail: 'neha@shobhit.ac.in' },
    },
    {
      name: 'Vivek Yadav',
      email: 'vivek.yadav@rgcollege.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'RG College', officialEmail: 'vivek@rgcollege.ac.in' },
    },
    {
      name: 'Anjali Singh',
      email: 'anjali.singh@rgcollege.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'RG College', officialEmail: 'anjali@rgcollege.ac.in' },
    },
    {
      name: 'Deepak Verma',
      email: 'deepak.verma@subharti.org',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'Subharti University', officialEmail: 'deepak@subharti.org' },
    },
    {
      name: 'Riya Chaudhary',
      email: 'riya.chaudhary@subharti.org',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'Subharti University', officialEmail: 'riya@subharti.org' },
    },
    {
      name: 'Arjun Malik',
      email: 'arjun.malik@imsec.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'IMS Engineering', officialEmail: 'arjun@imsec.ac.in' },
    },
    {
      name: 'Sneha Jain',
      email: 'sneha.jain@imsec.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'IMS Engineering', officialEmail: 'sneha@imsec.ac.in' },
    },
    {
      name: 'Mohit Rawat',
      email: 'mohit.rawat@miet.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'MIET', officialEmail: 'mohit@miet.ac.in' },
    },
    {
      name: 'Kavya Pandey',
      email: 'kavya.pandey@miet.ac.in',
      password: pw,
      role: 'student',
      studentDetails: { collegeName: 'MIET', officialEmail: 'kavya@miet.ac.in' },
    },
  ]);
  console.log(`Inserted ${students.length} students`);

  // ── ORGANIZERS ────────────────────────────────────────────
  const organizers = await User.insertMany([
    {
      name: 'Rakesh Dixit',
      email: 'rakesh@soundblastmeerut.com',
      password: pw,
      role: 'organizer',
      vendorDetails: { companyName: 'SoundBlast Events', phone: '9997123456', address: 'Shastri Nagar, Meerut', experience: '9 years DJ & Sound' },
    },
    {
      name: 'Sunita Bajaj',
      email: 'sunita@lightmagicevents.com',
      password: pw,
      role: 'organizer',
      vendorDetails: { companyName: 'Light Magic Events', phone: '9876554321', address: 'Ganga Nagar, Meerut', experience: '6 years Lighting' },
    },
    {
      name: 'Mohit Goel',
      email: 'mohit@goldendecorations.com',
      password: pw,
      role: 'organizer',
      vendorDetails: { companyName: 'Golden Decorations', phone: '9910077889', address: 'Garh Road, Meerut', experience: '12 years Decoration' },
    },
    {
      name: 'Pooja Awasthi',
      email: 'pooja@lensartphoto.com',
      password: pw,
      role: 'organizer',
      vendorDetails: { companyName: 'LensArt Photography', phone: '9899234565', address: 'Hapur Road, Meerut', experience: '7 years Photography' },
    },
    {
      name: 'Sanjay Mittal',
      email: 'sanjay@meerutcatering.com',
      password: pw,
      role: 'organizer',
      vendorDetails: { companyName: 'Meerut Catering Services', phone: '9935012345', address: 'Shastri Nagar, Meerut', experience: '15 years Catering' },
    },
    {
      name: 'Amit Saxena',
      email: 'amit@stagepromeerut.com',
      password: pw,
      role: 'organizer',
      vendorDetails: { companyName: 'Stage Pro Meerut', phone: '9897654321', address: 'Begum Bridge, Meerut', experience: '5 years Stage Setup' },
    },
    {
      name: 'Rekha Sharma',
      email: 'rekha@clicksncoverage.com',
      password: pw,
      role: 'organizer',
      vendorDetails: { companyName: 'Clicks N Coverage', phone: '9811223344', address: 'Pallavpuram, Meerut', experience: '4 years Photography & Video' },
    },
  ]);
  console.log(`Inserted ${organizers.length} organizers`);

  // ── COMPANIES ─────────────────────────────────────────────
  const companies = await User.insertMany([
    {
      name: 'Ganga Sweets & Confectionery',
      email: 'marketing@gangasweets.com',
      password: pw,
      role: 'company',
      vendorDetails: { companyName: 'Ganga Sweets Pvt. Ltd.', phone: '9412345678', address: 'Hapur Road, Meerut', experience: 'FMCG, Sweets & Confectionery' },
    },
    {
      name: 'Meerut Sports Industries',
      email: 'ads@meerutsports.in',
      password: pw,
      role: 'company',
      vendorDetails: { companyName: 'Meerut Sports Industries', phone: '9837654321', address: 'Sports Colony, Meerut', experience: 'Sports goods manufacturer' },
    },
    {
      name: 'Saraswati Vidya Coaching',
      email: 'sponsor@saraswaticoaching.com',
      password: pw,
      role: 'company',
      vendorDetails: { companyName: 'Saraswati Coaching Centre', phone: '9756123456', address: 'Civil Lines, Meerut', experience: 'Education & coaching' },
    },
    {
      name: 'TechZone Electronics Meerut',
      email: 'info@techzonemeerut.com',
      password: pw,
      role: 'company',
      vendorDetails: { companyName: 'TechZone Electronics', phone: '9654321987', address: 'Begum Bridge Market, Meerut', experience: 'Electronics retail & wholesale' },
    },
    {
      name: 'Shree Ram Clothing Co.',
      email: 'contact@shreeram.com',
      password: pw,
      role: 'company',
      vendorDetails: { companyName: 'Shree Ram Clothing Co.', phone: '9512345678', address: 'Sadar Bazar, Meerut', experience: 'Garments & uniforms manufacturer' },
    },
  ]);
  console.log(`Inserted ${companies.length} companies`);

  // ── EVENTS ────────────────────────────────────────────────
  const now = new Date();
  const future = (d) => new Date(now.getTime() + d * 86400000);
  const past   = (d) => new Date(now.getTime() - d * 86400000);

  const events = await Event.insertMany([
    {
      title: 'MIET TechFest 2026',
      description: 'Annual inter-college technology festival: hackathon, robotics, paper presentations, and startup pitch contest. Open to all engineering students.',
      date: future(18), location: 'MIET Auditorium, Meerut',
      ticketPrice: 150, collegeId: colleges[0]._id, status: 'upcoming',
    },
    {
      title: 'MIET Culturals — Rang De Meerut',
      description: 'Three-day cultural carnival: dance, music, drama, fashion show and nukkad natak.',
      date: future(35), location: 'MIET Open-Air Amphitheatre, Meerut',
      ticketPrice: 100, collegeId: colleges[0]._id, status: 'upcoming',
    },
    {
      title: 'Shobhit Science Symposium 2026',
      description: 'National-level symposium on AI, Blockchain, and Green Energy. Keynote speakers from IIT Delhi.',
      date: future(12), location: 'Shobhit University, Modipuram, Meerut',
      ticketPrice: 200, collegeId: colleges[1]._id, status: 'upcoming',
    },
    {
      title: "Shobhit Fresher's Party 2026",
      description: "Grand welcome event for batch 2026 — games, live music, food stalls, and fresher king & queen crowning.",
      date: future(8), location: 'Shobhit University Indoor Stadium',
      ticketPrice: 0, collegeId: colleges[1]._id, status: 'upcoming',
    },
    {
      title: 'RG College Annual Sports Meet',
      description: 'Inter-college sports tournament: cricket, badminton, kabaddi, athletics, chess. Gold medals for winners.',
      date: future(25), location: 'RG College Sports Ground, Meerut',
      ticketPrice: 50, collegeId: colleges[2]._id, status: 'upcoming',
    },
    {
      title: 'RG Debate Championship — Yuvavani',
      description: 'Hindi & English debate on social issues. Expert judges from judiciary and media. First prize: ₹10,000.',
      date: future(14), location: 'RG College Seminar Hall, Meerut',
      ticketPrice: 0, collegeId: colleges[2]._id, status: 'upcoming',
    },
    {
      title: 'Subharti MedFest 2026',
      description: 'Healthcare innovation expo with guest lectures, surgical demos, and inter-college medical quiz.',
      date: future(30), location: 'Subhartipuram Campus, Meerut',
      ticketPrice: 100, collegeId: colleges[3]._id, status: 'upcoming',
    },
    {
      title: 'Subharti Law Moot Court Competition',
      description: 'National moot court competition for law students, judged by senior advocates of Meerut Bar.',
      date: future(22), location: 'Subharti Law School, Meerut',
      ticketPrice: 75, collegeId: colleges[3]._id, status: 'upcoming',
    },
    {
      title: 'IMS Techathon 2026',
      description: '24-hour hackathon to build solutions for smart city problems. Prizes worth ₹50,000.',
      date: future(10), location: 'IMS Engineering, Ghaziabad',
      ticketPrice: 0, collegeId: colleges[4]._id, status: 'upcoming',
    },
    {
      title: 'IMS Cultural Night',
      description: 'Grand cultural evening with live bands, comedy acts, and a DJ night to wrap up the semester.',
      date: future(40), location: 'IMS Engineering Grounds, Ghaziabad',
      ticketPrice: 120, collegeId: colleges[4]._id, status: 'upcoming',
    },
    {
      title: 'MIET Hackathon — Code for Meerut',
      description: '36-hour hackathon for civic tech solutions: traffic, waste management, and smart water supply.',
      date: past(5), location: 'MIET Computer Centre, Meerut',
      ticketPrice: 0, collegeId: colleges[0]._id, status: 'completed',
    },
    {
      title: 'Shobhit Youth Leadership Summit',
      description: 'Day-long summit on public speaking, entrepreneurship, and leadership. Chief Guest: Dr. M.K. Sharma, IAS.',
      date: past(10), location: 'Shobhit Convention Centre, Meerut',
      ticketPrice: 250, collegeId: colleges[1]._id, status: 'completed',
    },
    {
      title: 'MIET Alumni Meet 2026',
      description: 'Grand reunion for all MIET batches. Networking, dinner, and awards ceremony.',
      date: future(45), location: 'MIET Main Ground, Meerut',
      ticketPrice: 500, collegeId: colleges[0]._id, status: 'upcoming',
    },
    {
      title: 'RG College Art & Craft Exhibition',
      description: 'Display of handmade arts, crafts, and paintings by fine arts students.',
      date: future(5), location: 'RG College Art Gallery, Meerut',
      ticketPrice: 20, collegeId: colleges[2]._id, status: 'upcoming',
    },
  ]);
  console.log(`Inserted ${events.length} events`);

  // ── QUOTATIONS ────────────────────────────────────────────
  await Quotation.insertMany([
    {
      eventId: events[0]._id, organizerId: organizers[0]._id, collegeId: colleges[0]._id,
      serviceType: 'DJ & Sound', proposedPrice: 45000,
      serviceCharges: [
        { item: 'Professional DJ Setup (8 hrs)', cost: 20000 },
        { item: 'Line Array Speaker System', cost: 15000 },
        { item: 'Sound Engineer', cost: 7000 },
        { item: 'Transport & Rigging', cost: 3000 },
      ],
      planningDetails: 'Arrive 4 hours before event start for setup and sound check. Full JBL line array setup tailored for outdoor acoustics. 9 years experience in college fests. Backup generator required from college.',
      message: 'SoundBlast Meerut has served 50+ college events across Meerut and Delhi NCR. We guarantee zero downtime and the highest audio clarity for both speeches and musical performances. Please review our itemized breakdown.',
      vendorContact: { name: 'Rakesh Dixit', phone: '+91 9997123456', companyName: 'SoundBlast Events', email: 'rakesh@soundblastmeerut.com', address: 'Shastri Nagar, Meerut', website: 'www.soundblastmeerut.com', gstNumber: '09AABCU9603R1ZX', experience: '9 years DJ & Sound' },
      status: 'pending',
    },
    {
      eventId: events[1]._id, organizerId: organizers[1]._id, collegeId: colleges[0]._id,
      serviceType: 'Lighting', proposedPrice: 38000,
      serviceCharges: [
        { item: 'LED Moving Heads (20 units)', cost: 18000 },
        { item: 'Laser Light Show', cost: 10000 },
        { item: 'Truss & Rigging', cost: 6000 },
        { item: 'Lighting Operator', cost: 4000 },
      ],
      planningDetails: 'Full lighting package for 3-day fest. Includes stage wash, LED backdrop programming, and synchronized laser show for evening performances. Requires 3-phase power supply.',
      message: 'Light Magic Events delivers world-class stage lighting at affordable rates. Our team consists of certified technicians. We are ready to accommodate any last-minute stage changes.',
      vendorContact: { name: 'Sunita Bajaj', phone: '+91 9876554321', companyName: 'Light Magic Events', email: 'sunita@lightmagicevents.com', address: 'Ganga Nagar, Meerut', website: 'www.lightmagicevents.com', gstNumber: '09BBBCU9603R1ZY', experience: '6 years Lighting' },
      status: 'accepted',
      note: 'Approved. Vendor provided the best lighting setup within our budget.'
    },
    {
      eventId: events[2]._id, organizerId: organizers[2]._id, collegeId: colleges[1]._id,
      serviceType: 'Decoration', proposedPrice: 28000,
      serviceCharges: [
        { item: 'Stage Backdrop (30ft)', cost: 12000 },
        { item: 'Welcome Gate & Arch', cost: 6000 },
        { item: 'Floral Decoration', cost: 7000 },
        { item: 'Labour', cost: 3000 },
      ],
      planningDetails: 'Science & Innovation theme integration. Blue-gold colour scheme using premium fabric and imported flowers. Setup to be completed the night before the symposium.',
      message: 'Golden Decorations has 12 years of experience catering to top Meerut colleges like MIET and Shobhit. We prioritize eco-friendly materials and elegant designs.',
      vendorContact: { name: 'Mohit Goel', phone: '+91 9910077889', companyName: 'Golden Decorations', email: 'mohit@goldendecorations.com', address: 'Garh Road, Meerut', website: 'www.goldendecorations.in', gstNumber: '09CCCU9603R1ZZ', experience: '12 years Decoration' },
      status: 'pending',
    },
    {
      eventId: events[4]._id, organizerId: organizers[3]._id, collegeId: colleges[2]._id,
      serviceType: 'Photography/Videography', proposedPrice: 22000,
      serviceCharges: [
        { item: 'Lead Photographer', cost: 10000 },
        { item: 'Drone Aerial Coverage', cost: 6000 },
        { item: 'Cinematic Reel (3 min)', cost: 4000 },
        { item: 'Edited Photo Album', cost: 2000 },
      ],
      planningDetails: 'Full-day sports coverage starting from opening ceremony to medal distribution. Drone coverage for outdoor track events. 500+ edited photos delivered in 3 days.',
      message: 'LensArt covered RG Sports 2024 & 2025. We know exactly how to capture the energy and emotion of sports events. A digital album will be provided for easy sharing among students.',
      vendorContact: { name: 'Pooja Awasthi', phone: '+91 9899234565', companyName: 'LensArt Photography', email: 'pooja@lensartphoto.com', address: 'Hapur Road, Meerut', website: 'www.lensartphoto.com', gstNumber: '09DDDCU9603R1ZA', experience: '7 years Photography' },
      status: 'rejected',
      note: 'Budget exceeded our limits for photography. Opting for student volunteer photographers instead.'
    },
    {
      eventId: events[6]._id, organizerId: organizers[4]._id, collegeId: colleges[3]._id,
      serviceType: 'Catering', proposedPrice: 55000,
      serviceCharges: [
        { item: 'Breakfast Buffet (200 persons)', cost: 18000 },
        { item: 'Lunch Buffet (200 persons)', cost: 22000 },
        { item: 'Evening Snacks (200 persons)', cost: 10000 },
        { item: 'Cutlery & Staff', cost: 5000 },
      ],
      planningDetails: 'Pure veg menu featuring regional UP cuisine and continental options. FSSAI compliant hygiene standards. Setup includes buffet counters, chaffing dishes, and uniformed service staff.',
      message: 'We served Subharti MedFest 2025 with excellent feedback. We ensure warm food throughout the event duration and prompt clearing of used plates.',
      vendorContact: { name: 'Sanjay Mittal', phone: '+91 9935012345', companyName: 'Meerut Catering Services', email: 'sanjay@meerutcatering.com', address: 'Shastri Nagar, Meerut', website: 'www.meerutcatering.com', gstNumber: '09EEECU9603R1ZB', experience: '15 years Catering' },
      status: 'pending',
    },
    {
      eventId: events[8]._id, organizerId: organizers[5]._id, collegeId: colleges[4]._id,
      serviceType: 'Stage Setup', proposedPrice: 32000,
      serviceCharges: [
        { item: 'Main Stage (40x30 ft)', cost: 18000 },
        { item: 'Podium & Backdrop', cost: 8000 },
        { item: 'Generator Backup', cost: 4000 },
        { item: 'Labour & Transport', cost: 2000 },
      ],
      planningDetails: 'Heavy-duty stage construction suitable for 20+ people at once. Setup completed 1 day before event. Dismantling done overnight post-event to avoid disruption.',
      message: 'Stage Pro Meerut provides reliable, on-time delivery for college events. We use anti-skid wooden flooring and robust trussing systems for maximum safety.',
      vendorContact: { name: 'Amit Saxena', phone: '+91 9897654321', companyName: 'Stage Pro Meerut', email: 'amit@stagepromeerut.com', address: 'Begum Bridge, Meerut', website: 'www.stagepromeerut.com', gstNumber: '09FFFCU9603R1ZC', experience: '5 years Stage Setup' },
      status: 'pending',
    },
    {
      eventId: events[5]._id, organizerId: organizers[6]._id, collegeId: colleges[2]._id,
      serviceType: 'Photography/Videography', proposedPrice: 15000,
      serviceCharges: [
        { item: 'Event Photography (2 Days)', cost: 8000 },
        { item: 'Live Streaming Setup', cost: 5000 },
        { item: 'Social Media Updates', cost: 2000 },
      ],
      planningDetails: 'Provide live streaming for debate championship. 2 camera setup with direct feed to college YouTube channel.',
      message: 'Clicks N Coverage specializes in live event broadcasting. We ensure HD quality streaming with zero buffer delays.',
      vendorContact: { name: 'Rekha Sharma', phone: '+91 9811223344', companyName: 'Clicks N Coverage', email: 'rekha@clicksncoverage.com', address: 'Pallavpuram, Meerut', website: 'www.clicksncoverage.com', gstNumber: '09GGGCU9603R1ZD', experience: '4 years Photography & Video' },
      status: 'pending',
    },
    {
      eventId: events[3]._id, organizerId: organizers[0]._id, collegeId: colleges[1]._id,
      serviceType: 'DJ & Sound', proposedPrice: 25000,
      serviceCharges: [
        { item: 'Club DJ Setup', cost: 15000 },
        { item: 'Bass Bins (4 units)', cost: 8000 },
        { item: 'Operator', cost: 2000 },
      ],
      planningDetails: 'High bass setup required for Fresher\'s party dance floor. 5 hours of continuous music.',
      message: 'SoundBlast is ready to rock the Shobhit Fresher\'s party! We will bring our best DJ who knows the latest trending tracks.',
      vendorContact: { name: 'Rakesh Dixit', phone: '+91 9997123456', companyName: 'SoundBlast Events', email: 'rakesh@soundblastmeerut.com', address: 'Shastri Nagar, Meerut', website: 'www.soundblastmeerut.com', gstNumber: '09AABCU9603R1ZX', experience: '9 years DJ & Sound' },
      status: 'accepted',
      note: 'SoundBlast has been finalized for the Fresher\'s party due to their excellent previous track record.'
    },
    {
      eventId: events[6]._id, organizerId: organizers[1]._id, collegeId: colleges[3]._id,
      serviceType: 'Lighting', proposedPrice: 18000,
      serviceCharges: [
        { item: 'Stage Lighting Setup', cost: 12000 },
        { item: 'Auditorium Wash Lights', cost: 6000 },
      ],
      planningDetails: 'Basic lighting setup for medical presentations and guest lectures. Needs to be professional and bright.',
      message: 'Light Magic Events can provide clean, white lighting suitable for medical demonstrations and clear visibility for the audience.',
      vendorContact: { name: 'Sunita Bajaj', phone: '+91 9876554321', companyName: 'Light Magic Events', email: 'sunita@lightmagicevents.com', address: 'Ganga Nagar, Meerut', website: 'www.lightmagicevents.com', gstNumber: '09BBBCU9603R1ZY', experience: '6 years Lighting' },
      status: 'pending',
    },
    {
      eventId: events[7]._id, organizerId: organizers[3]._id, collegeId: colleges[3]._id,
      serviceType: 'Photography/Videography', proposedPrice: 12000,
      serviceCharges: [
        { item: 'Candid Photography', cost: 5000 },
        { item: 'Video Recording of Moot Court', cost: 7000 },
      ],
      planningDetails: 'Full day recording of the moot court competition for college archives and grading.',
      message: 'LensArt Photography will use silent shutter cameras to ensure no disturbance during the moot court proceedings.',
      vendorContact: { name: 'Pooja Awasthi', phone: '+91 9899234565', companyName: 'LensArt Photography', email: 'pooja@lensartphoto.com', address: 'Hapur Road, Meerut', website: 'www.lensartphoto.com', gstNumber: '09DDDCU9603R1ZA', experience: '7 years Photography' },
      status: 'accepted',
      note: 'Quotation accepted based on the silent shutter provision.'
    },
    {
      eventId: events[8]._id, organizerId: organizers[4]._id, collegeId: colleges[4]._id,
      serviceType: 'Catering', proposedPrice: 85000,
      serviceCharges: [
        { item: '4 Meals for Hackathon (300 pax)', cost: 70000 },
        { item: 'Midnight Coffee/Tea Station', cost: 15000 },
      ],
      planningDetails: 'Continuous food supply for 24-hour hackathon. Includes dinner, midnight snacks, breakfast, and lunch.',
      message: 'Meerut Catering Services is experienced in managing 24-hour events. We will keep the coffee station running all night for the coders.',
      vendorContact: { name: 'Sanjay Mittal', phone: '+91 9935012345', companyName: 'Meerut Catering Services', email: 'sanjay@meerutcatering.com', address: 'Shastri Nagar, Meerut', website: 'www.meerutcatering.com', gstNumber: '09EEECU9603R1ZB', experience: '15 years Catering' },
      status: 'pending',
    },
    {
      eventId: events[9]._id, organizerId: organizers[0]._id, collegeId: colleges[4]._id,
      serviceType: 'DJ & Sound', proposedPrice: 35000,
      serviceCharges: [
        { item: 'Concert Sound System', cost: 25000 },
        { item: 'DJ & MC', cost: 10000 },
      ],
      planningDetails: 'Massive sound setup for outdoor cultural night expecting 1000+ students.',
      message: 'SoundBlast guarantees an unforgettable night. We have the required wattage to cover the entire IMS Engineering grounds.',
      vendorContact: { name: 'Rakesh Dixit', phone: '+91 9997123456', companyName: 'SoundBlast Events', email: 'rakesh@soundblastmeerut.com', address: 'Shastri Nagar, Meerut', website: 'www.soundblastmeerut.com', gstNumber: '09AABCU9603R1ZX', experience: '9 years DJ & Sound' },
      status: 'rejected',
      note: 'Budget is too high, looking for alternatives.'
    },
    {
      eventId: events[12]._id, organizerId: organizers[2]._id, collegeId: colleges[0]._id,
      serviceType: 'Decoration', proposedPrice: 40000,
      serviceCharges: [
        { item: 'Gala Dinner Decor', cost: 25000 },
        { item: 'Photo Booths (3 themes)', cost: 15000 },
      ],
      planningDetails: 'Elegant and nostalgic theme for returning alumni. Setup includes 3 different photo booths spanning different eras.',
      message: 'Golden Decorations will create a premium ambiance for the esteemed alumni of MIET. We use imported fabrics and lighting for the photo booths.',
      vendorContact: { name: 'Mohit Goel', phone: '+91 9910077889', companyName: 'Golden Decorations', email: 'mohit@goldendecorations.com', address: 'Garh Road, Meerut', website: 'www.goldendecorations.in', gstNumber: '09CCCU9603R1ZZ', experience: '12 years Decoration' },
      status: 'pending',
    },
  ]);
  console.log('Inserted quotations');

  // ── AD REQUESTS ───────────────────────────────────────────
  await AdRequest.insertMany([
    {
      eventId: events[0]._id, companyId: companies[1]._id, collegeId: colleges[0]._id,
      adTitle: 'Meerut Sports — TechFest Sponsor', adType: 'Banner', budget: 50000,
      targetAudience: 'Engineering students, tech enthusiasts, youth aged 18-24.',
      bannerRequirements: 'We need a prominent 40x20ft stage backdrop featuring our logo and tagline "Gear Up For Success". Additionally, 5 standees at the main entrance and our logo printed on the back of all participant T-shirts.',
      callToAction: 'Visit our store in Sports Colony for an exclusive 20% student discount!',
      status: 'pending',
    },
    {
      eventId: events[1]._id, companyId: companies[0]._id, collegeId: colleges[0]._id,
      adTitle: 'Ganga Sweets — Rang De Sponsor', adType: 'Stage Backdrop', budget: 25000,
      targetAudience: 'College students, faculty members, and local families attending the fest.',
      bannerRequirements: 'Looking for stage naming rights ("Ganga Sweets Main Stage"), a large welcome banner at the entrance gate, and permission to set up 2 sweets/snacks distribution stalls near the food court.',
      callToAction: 'Taste the sweetness of Meerut! Scan the QR code on our banner for a free box of sweets on your first online order.',
      status: 'accepted',
    },
    {
      eventId: events[4]._id, companyId: companies[1]._id, collegeId: colleges[2]._id,
      adTitle: 'Meerut Sports — Sports Meet Sponsor', adType: 'Merchandise', budget: 40000,
      targetAudience: 'Sports students, athletes, physical education coaches.',
      bannerRequirements: 'We require Title sponsorship visibility. Our logo must be on all sports kits (jerseys, tracksuits) provided to the winners. Also need 10 boundary boards placed around the cricket/athletic ground.',
      callToAction: 'Upgrade your game! Follow @MeerutSports on Instagram.',
      status: 'pending',
    },
    {
      eventId: events[2]._id, companyId: companies[2]._id, collegeId: colleges[1]._id,
      adTitle: 'Saraswati Coaching — Symposium Sponsor', adType: 'Stall', budget: 15000,
      targetAudience: 'Science students, final year graduates looking for competitive exam prep.',
      bannerRequirements: 'A 10x10ft stall space inside the main symposium hall. We will place our own flex banners. We also want a full-page color ad in the symposium schedule booklet.',
      callToAction: 'Enroll today for our upcoming GATE/CAT prep batches! Special discount for Shobhit University students.',
      status: 'rejected',
    },
    {
      eventId: events[8]._id, companyId: companies[3]._id, collegeId: colleges[4]._id,
      adTitle: 'TechZone Electronics — Techathon Sponsor', adType: 'LED Screen', budget: 35000,
      targetAudience: 'Tech students, developers, IT enthusiasts.',
      bannerRequirements: 'A 30-second promotional video to be played on the main LED screen every 3 hours during the 24-hour hackathon. Our logo should be included in the participant welcome kits (notebooks, pens).',
      callToAction: 'Use code TECHZONE2026 on our website to get flat 10% off on all laptops and accessories.',
      status: 'pending',
    },
    {
      eventId: events[9]._id, companyId: companies[4]._id, collegeId: colleges[4]._id,
      adTitle: 'Shree Ram Clothing — Cultural Night Sponsor', adType: 'Social Media', budget: 20000,
      targetAudience: 'College youth interested in fashion and lifestyle.',
      bannerRequirements: 'At least 3 dedicated posts on the official college Instagram/Facebook pages tagging our brand. A large banner at the entry gate, and a 30-sec PA announcement by the host during prime time.',
      callToAction: 'Check out our latest ethnic and western wear collection at Sadar Bazar, Meerut!',
      status: 'pending',
    },
    {
      eventId: events[3]._id, companyId: companies[0]._id, collegeId: colleges[1]._id,
      adTitle: 'Ganga Sweets — Fresher\'s Party', adType: 'Stall', budget: 12000,
      targetAudience: 'New incoming students and existing students.',
      bannerRequirements: 'A 10x10ft stall to sell fresh snacks and sweets at a discounted rate to students during the party.',
      callToAction: 'Grab a quick bite! Special 15% discount for all freshers.',
      status: 'accepted',
    },
    {
      eventId: events[5]._id, companyId: companies[2]._id, collegeId: colleges[2]._id,
      adTitle: 'Saraswati Coaching — Debate Sponsor', adType: 'Pamphlet', budget: 8000,
      targetAudience: 'Arts and Commerce students looking for competitive exams.',
      bannerRequirements: 'Permission to distribute our coaching pamphlets at the entrance of the seminar hall and an announcement by the host.',
      callToAction: 'Prepare for UPSC with Saraswati Coaching. Free demo class next Sunday!',
      status: 'pending',
    },
    {
      eventId: events[6]._id, companyId: companies[0]._id, collegeId: colleges[3]._id,
      adTitle: 'Ganga Sweets — MedFest Stall', adType: 'Stall', budget: 15000,
      targetAudience: 'Medical students, doctors, and visitors.',
      bannerRequirements: 'We want to set up a hygienic refreshment stall serving packaged sweets and healthy snacks during the exhibition.',
      callToAction: 'Healthy snacks for healthy minds! Visit Ganga Sweets stall.',
      status: 'accepted',
    },
    {
      eventId: events[7]._id, companyId: companies[4]._id, collegeId: colleges[3]._id,
      adTitle: 'Shree Ram Clothing — Formal Wear', adType: 'Social Media', budget: 10000,
      targetAudience: 'Law students needing formal attire.',
      bannerRequirements: 'Please post our ad on the college WhatsApp groups and Facebook page targeting law students.',
      callToAction: 'Get 20% off on premium formal suits. Show your college ID at Shree Ram Clothing Co.',
      status: 'pending',
    },
    {
      eventId: events[12]._id, companyId: companies[2]._id, collegeId: colleges[0]._id,
      adTitle: 'Saraswati Coaching — Alumni Outreach', adType: 'Pamphlet', budget: 5000,
      targetAudience: 'Graduated students looking for UPSC/Civil services coaching.',
      bannerRequirements: 'Place our brochures on the registration desks during the Alumni Meet.',
      callToAction: 'Never too late to aim for civil services. Special batches for working professionals.',
      status: 'rejected',
    },
    {
      eventId: events[13]._id, companyId: companies[1]._id, collegeId: colleges[2]._id,
      adTitle: 'Meerut Sports — Art Exhibition', adType: 'Banner', budget: 8000,
      targetAudience: 'Students and parents attending the exhibition.',
      bannerRequirements: 'One large banner near the exit gate of the art gallery.',
      callToAction: 'Creative minds need active bodies. Check out our new range of fitness gear.',
      status: 'pending',
    },
    {
      eventId: events[9]._id, companyId: companies[3]._id, collegeId: colleges[4]._id,
      adTitle: 'TechZone — Cultural Night Sponsor', adType: 'Stage Backdrop', budget: 45000,
      targetAudience: 'Engineering students.',
      bannerRequirements: 'Co-sponsor branding on the main stage backdrop alongside the college name.',
      callToAction: 'The ultimate student discount is here. Buy a laptop, get a smartwatch free!',
      status: 'pending',
    },
  ]);
  console.log('Inserted ad requests');

  // ── CAMPAIGNS ─────────────────────────────────────────────
  const campaigns = await Campaign.insertMany([
    {
      companyId: companies[0]._id,
      title: 'Healthy Campus Initiative',
      description: 'Funding for organic fruit stalls and wellness workshops across major Meerut colleges.',
      goalAmount: 200000, raisedAmount: 45000, category: 'Social Cause',
      deadline: future(60), targetColleges: [colleges[0]._id, colleges[1]._id],
      benefits: 'Brand logo on all wellness kits, naming rights for the "Ganga Wellness Zone".',
    },
    {
      companyId: companies[3]._id,
      title: 'Digital Literacy Drive',
      description: 'Sponsoring coding bootcamps and providing hardware for underprivileged tech students.',
      goalAmount: 500000, raisedAmount: 120000, category: 'Tech',
      deadline: future(90), targetColleges: [colleges[0]._id, colleges[4]._id],
      benefits: 'TechZone logo on all distributed hardware, speaking slot at the final graduation event.',
    },
    {
      companyId: companies[1]._id,
      title: 'Meerut Sports Scholarship 2026',
      description: 'Providing kits and travel grants for state-level athletes from MIET and RG College.',
      goalAmount: 300000, raisedAmount: 150000, category: 'Sports',
      deadline: future(45), targetColleges: [colleges[0]._id, colleges[2]._id],
      benefits: 'Banner placement at all college sports grounds, logo on official sports jerseys.',
    },
  ]);
  console.log(`Inserted ${campaigns.length} campaigns`);

  // ── TICKETS ───────────────────────────────────────────────
  const tickets = await Ticket.insertMany([
    { eventId: events[0]._id, studentId: students[0]._id, pricePaid: 150, passType: 'general', status: 'active' },
    { eventId: events[0]._id, studentId: students[1]._id, pricePaid: 150, passType: 'general', status: 'active' },
    { eventId: events[1]._id, studentId: students[0]._id, pricePaid: 100, passType: 'general', status: 'active' },
    { eventId: events[2]._id, studentId: students[2]._id, pricePaid: 200, passType: 'general', status: 'active' },
    { eventId: events[3]._id, studentId: students[3]._id, pricePaid: 0, passType: 'general', isFreePass: true, status: 'active' },
    { eventId: events[4]._id, studentId: students[4]._id, pricePaid: 50, passType: 'general', status: 'used', isUsed: true, scannedAt: past(1) },
    { eventId: events[0]._id, studentId: students[10]._id, pricePaid: 150, passType: 'vip', status: 'active' },
    { eventId: events[1]._id, studentId: students[11]._id, pricePaid: 100, passType: 'general', status: 'active' },
  ]);
  console.log(`Inserted ${tickets.length} tickets`);

  console.log('\n========== SEED COMPLETE ==========');
  console.log('Password for ALL accounts: 12345678');
  console.log('---');
  console.log('COLLEGES:');
  console.log('  admin@miet.ac.in');
  console.log('  admin@shobhituniversity.ac.in');
  console.log('  admin@rgcollege.ac.in');
  console.log('  admin@subharti.org');
  console.log('  admin@imsec.ac.in');
  console.log('---');
  console.log('STUDENTS:');
  console.log('  aarav.sharma@miet.ac.in');
  console.log('  priya.gupta@miet.ac.in');
  console.log('  rahul.tyagi@shobhit.ac.in');
  console.log('  neha.agarwal@shobhit.ac.in');
  console.log('  arjun.malik@imsec.ac.in');
  console.log('---');
  console.log('ORGANIZERS:');
  console.log('  rakesh@soundblastmeerut.com');
  console.log('  sunita@lightmagicevents.com');
  console.log('  amit@stagepromeerut.com');
  console.log('---');
  console.log('COMPANIES:');
  console.log('  marketing@gangasweets.com');
  console.log('  ads@meerutsports.in');
  console.log('  info@techzonemeerut.com');
  console.log('===================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
