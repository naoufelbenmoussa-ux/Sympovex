// Local Mock Database Engine for Sympovex Conference SaaS

const DB_KEY = 'sympovex_mock_db';

// Helper to generate IDs
const uid = () => Math.random().toString(36).substr(2, 9);

// Default seed data
const initialDb = {
  conferences: [
    {
      id: 'gacs2026',
      name: 'Global AI & Cyber-Security Summit (GACS 2026)',
      startDate: '2026-10-12',
      endDate: '2026-10-15',
      venue: 'Palais des Congrès, Paris, France',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
      colors: {
        primary: '#6366f1', // Indigo
        secondary: '#4f46e5',
        accent: '#f59e0b' // Amber
      }
    },
    {
      id: 'icqc2026',
      name: 'International Congress on Quantum Computing (ICQC 2026)',
      startDate: '2026-11-20',
      endDate: '2026-11-23',
      venue: 'MIT Media Lab, Boston, USA',
      logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&auto=format&fit=crop&q=60',
      colors: {
        primary: '#10b981', // Emerald
        secondary: '#047857',
        accent: '#3b82f6' // Blue
      }
    }
  ],
  users: [
    {
      id: 'usr_superadmin',
      email: 'superadmin@sympovex.com',
      password: 'password123',
      status: 'active',
      name: 'Dr. Jean-Pierre Blanc',
      role: 'Superadmin',
      affiliation: 'Sympovex Global Foundation',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60',
      attribute: 'Research Professor',
      topics: ['AI', 'Quantum', 'Security']
    },
    {
      id: 'usr_president',
      email: 'president@gacs.org',
      password: 'password123',
      status: 'active',
      name: 'Prof. Amara Diallo',
      role: 'President',
      conferenceId: 'gacs2026',
      affiliation: 'Sorbonne Université, CNRS',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60',
      attribute: 'Research Professor',
      topics: ['AI Ethics', 'Machine Learning']
    },
    {
      id: 'usr_poc',
      email: 'poc@gacs.org',
      password: 'password123',
      status: 'active',
      name: 'Sophie Laurent',
      role: 'POC',
      conferenceId: 'gacs2026',
      affiliation: 'Inria Organization Committee',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
      attribute: 'Engineer',
      topics: ['Logistics', 'Public Relations']
    },
    {
      id: 'usr_psc',
      email: 'psc@gacs.org',
      password: 'password123',
      status: 'active',
      name: 'Prof. Thomas Sterling',
      role: 'PSC',
      conferenceId: 'gacs2026',
      affiliation: 'LPTHE Laboratory',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60',
      attribute: 'Research Professor',
      topics: ['Deep Learning', 'Quantum Security']
    },
    {
      id: 'usr_reviewer1',
      email: 'rev1@gacs.org',
      password: 'password123',
      status: 'active',
      name: 'Dr. Evelyn Martinez',
      role: 'Reviewer',
      conferenceId: 'gacs2026',
      affiliation: 'Stanford AI Lab',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60',
      attribute: 'Research Professor',
      topics: ['Deep Learning', 'NLP']
    },
    {
      id: 'usr_reviewer2',
      email: 'rev2@gacs.org',
      password: 'password123',
      status: 'active',
      name: 'Dr. Hiroshi Tanaka',
      role: 'Reviewer',
      conferenceId: 'gacs2026',
      affiliation: 'University of Tokyo',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60',
      attribute: 'Engineer',
      topics: ['Cybersecurity', 'Cryptography']
    },
    {
      id: 'usr_author1',
      email: 'author1@gmail.com',
      password: 'password123',
      status: 'active',
      name: 'Lucas Bernard',
      role: 'Author',
      conferenceId: 'gacs2026',
      affiliation: 'ENS Paris-Saclay',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60',
      attribute: 'PhD Student',
      topics: ['NLP', 'Deep Learning']
    },
    {
      id: 'usr_author2',
      email: 'author2@gmail.com',
      password: 'password123',
      status: 'active',
      name: 'Clara Oswald',
      role: 'Author',
      conferenceId: 'gacs2026',
      affiliation: 'Imperial College London',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60',
      attribute: 'PhD Student',
      topics: ['Cryptography', 'Cybersecurity']
    },
    {
      id: 'usr_participant',
      email: 'visitor@gmail.com',
      password: 'password123',
      status: 'active',
      name: 'Marc Dupont',
      role: 'Participant',
      conferenceId: 'gacs2026',
      affiliation: 'Orange Labs R&D',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
      attribute: 'Industrialist',
      topics: ['Cybersecurity']
    }
  ],
  papers: [
    {
      id: 'pap_001',
      conferenceId: 'gacs2026',
      title: 'Optimizing Transformer Attention with Sparse Toeplitz Matrices',
      abstract: 'We present a novel method to accelerate self-attention computation in Transformer architectures. By modeling the attention matrix using sparse Toeplitz blocks, we achieve O(N log N) computational complexity while retaining 98% of the model accuracy on standard NLP translation datasets.',
      keywords: 'Transformer, Attention, Sparse Matrices, NLP',
      submitterId: 'usr_author1',
      authors: [
        { name: 'Lucas Bernard', affiliation: 'ENS Paris-Saclay', email: 'author1@gmail.com' },
        { name: 'Dr. Alice Dupont', affiliation: 'CNRS', email: 'alice.dupont@cnrs.fr' }
      ],
      reviewerIds: ['usr_reviewer1'],
      status: 'Revision Required',
      versions: [
        {
          version: 'V1',
          timestamp: '2026-06-15T14:32:00Z',
          fileName: 'transformer_attention_v1.pdf',
          fileSize: '1.2 MB'
        }
      ]
    },
    {
      id: 'pap_002',
      conferenceId: 'gacs2026',
      title: 'Quantum Key Distribution Under Side-Channel Acoustic Attacks',
      abstract: 'Acoustic attacks present a major threat to physical cryptography devices. In this paper, we evaluate the vulnerability of fiber-optic QKD terminals to laser microphone interception. We propose an active acoustic noise-cancellation defense strategy.',
      keywords: 'QKD, Cryptography, Side-channel, Acoustic attack',
      submitterId: 'usr_author2',
      authors: [
        { name: 'Clara Oswald', affiliation: 'Imperial College London', email: 'author2@gmail.com' }
      ],
      reviewerIds: ['usr_reviewer2'],
      status: 'Accepted',
      versions: [
        {
          version: 'V1',
          timestamp: '2026-06-20T10:15:00Z',
          fileName: 'qkd_sidechannel_v1.pdf',
          fileSize: '2.4 MB'
        },
        {
          version: 'V2',
          timestamp: '2026-06-28T09:40:00Z',
          fileName: 'qkd_sidechannel_v2_final.pdf',
          fileSize: '2.5 MB'
        }
      ]
    }
  ],
  reviews: [
    {
      id: 'rev_001',
      paperId: 'pap_001',
      reviewerId: 'usr_reviewer1',
      originality: 4,
      methodology: 3,
      relevance: 5,
      comments: 'The paper is mathematically sound, but needs a clearer comparison section with FlashAttention-2. The benchmarks on A100 are missing. Please add these in a revised version.',
      timestamp: '2026-06-22T16:00:00Z'
    },
    {
      id: 'rev_002',
      paperId: 'pap_002',
      reviewerId: 'usr_reviewer2',
      originality: 5,
      methodology: 4,
      relevance: 5,
      comments: 'Fascinating study! The acoustic intercept models are highly original. The V2 revision successfully addressed the security proof flaws highlighted in our draft feedback.',
      timestamp: '2026-06-27T11:20:00Z'
    }
  ],
  posters: [
    {
      id: 'pos_001',
      conferenceId: 'gacs2026',
      title: 'Visualizing Neural Activation Pathways in Real-time LLMs',
      author: 'Lucas Bernard',
      affiliation: 'ENS Paris-Saclay',
      topic: 'AI',
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
      comments: [
        { id: '1', user: 'Marc Dupont', text: 'How do you handle quantization path mismatches during visualization?', timestamp: '2026-06-30T10:00:00Z' },
        { id: '2', user: 'Lucas Bernard', text: 'We overlay the scaled float16 model weights as a baseline difference; the quantized channels are highlighted in yellow.', timestamp: '2026-06-30T10:12:00Z' }
      ]
    },
    {
      id: 'pos_002',
      conferenceId: 'gacs2026',
      title: 'Graph Neural Networks for Automated Zero-Day Intrusion Blocking',
      author: 'Dr. Hiroshi Tanaka',
      affiliation: 'University of Tokyo',
      topic: 'Cybersecurity',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      comments: []
    }
  ],
  speakers: [
    {
      id: 'spk_001',
      conferenceId: 'gacs2026',
      name: 'Dr. Aris Thorne',
      affiliation: 'AI Director at DeepMind Europe',
      bio: 'Dr. Aris Thorne is a leading researcher in generative models and neural efficiency. He obtained his PhD from Cambridge and has authored over 80 publications in NIPS, ICML, and CVPR.',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=60',
      contact: 'aris.thorne@deepmind.com',
      talkTitle: 'Beyond Scaling Laws: Designing Architectures for Next-Gen Cognitive Autonomy',
      talkAbstract: 'Scaling compute and parameters has driven the transformer revolution. However, cognitive reasoning requires architectures capable of structured planning and active memory retrieval. This talk details current breakthroughs in non-autoregressive language models.'
    },
    {
      id: 'spk_002',
      conferenceId: 'gacs2026',
      name: 'Prof. Sarah Jenkins',
      affiliation: 'Chair of Cryptographic Systems at Oxford',
      bio: 'Sarah Jenkins is a pioneer in lattice-based cryptography and post-quantum network protocols. She acts as a chief government advisor for transition standards in national intelligence operations.',
      photo: 'https://images.unsplash.com/photo-1544717277-994b96273b24?w=150&auto=format&fit=crop&q=60',
      contact: 'sarah.jenkins@ox.ac.uk',
      talkTitle: 'Navigating the Crypto-Apocalypse: The Hard Transition to Post-Quantum Infrastructure',
      talkAbstract: 'With quantum computing power scaling exponentially, classical elliptic curves will soon fall. This presentation reviews the NIST-standardized algorithms and details practical deployment strategies in legacy telecommunication systems.'
    }
  ],
  schedule: [
    {
      id: 'sch_1',
      conferenceId: 'gacs2026',
      day: 'Day 1',
      time: '09:00 - 10:30',
      track: 'Plenary',
      room: 'Amphitheater A',
      title: 'Opening Ceremony & Keynote: Beyond Scaling Laws',
      speaker: 'Dr. Aris Thorne',
      chairperson: 'Prof. Amara Diallo',
      description: 'Opening remarks by the organizing committee followed by a keynote address on generative AI architectures.'
    },
    {
      id: 'sch_2',
      conferenceId: 'gacs2026',
      day: 'Day 1',
      time: '11:00 - 12:30',
      track: 'AI / Deep Learning',
      room: 'Room 101',
      title: 'Oral Session: Transformers & Matrix Acceleration',
      speaker: 'Lucas Bernard',
      chairperson: 'Dr. Evelyn Martinez',
      description: 'Presentation of accepted papers focusing on model efficiency, including sparse matrix attention mechanisms.'
    },
    {
      id: 'sch_3',
      conferenceId: 'gacs2026',
      day: 'Day 1',
      time: '11:00 - 12:30',
      track: 'Cybersecurity',
      room: 'Room 202',
      title: 'Oral Session: Securing Network Infrastructures',
      speaker: 'Dr. Hiroshi Tanaka',
      chairperson: 'Prof. Thomas Sterling',
      description: 'Presentations on intrusion detection, GNN network monitoring, and real-time DDoS mitigation strategies.'
    },
    {
      id: 'sch_4',
      conferenceId: 'gacs2026',
      day: 'Day 2',
      time: '09:00 - 10:30',
      track: 'Plenary',
      room: 'Amphitheater A',
      title: 'Keynote: Navigating the Crypto-Apocalypse',
      speaker: 'Prof. Sarah Jenkins',
      chairperson: 'Prof. Thomas Sterling',
      description: 'Overview of lattice-based cryptography standards and integration blockers.'
    }
  ],
  tickets: [
    {
      id: 'tkt_001',
      conferenceId: 'gacs2026',
      senderId: 'usr_author1',
      senderName: 'Lucas Bernard',
      category: 'Technical', // Technical, Registration/Payment, Scientific Track, Accommodation
      subject: 'Unable to upload file bigger than 10MB',
      message: 'Hello, I am trying to upload my revised paper, but it is failing due to file size. It contains high-res figures. Can you please assist?',
      assignedTo: 'CO', // CO (Comité d'Organisation) or CS (Comité Scientifique)
      status: 'Open',
      replies: [
        { id: 'r1', senderName: 'Sophie Laurent (CO)', text: 'Hello Lucas, please try resizing the embedded images. If it still fails, you can upload a compressed version. We will review this.', timestamp: '2026-06-29T11:00:00Z' }
      ],
      timestamp: '2026-06-29T10:15:00Z'
    },
    {
      id: 'tkt_002',
      conferenceId: 'gacs2026',
      senderId: 'usr_author2',
      senderName: 'Clara Oswald',
      category: 'Scientific Track',
      subject: 'Review criteria clarifications',
      message: 'I want to ask if the page limit for the final version of the accepted papers is strictly 8 pages, excluding references.',
      assignedTo: 'CS',
      status: 'Closed',
      replies: [
        { id: 'r2', senderName: 'Prof. Thomas Sterling (CS)', text: 'Yes Clara, the limit is strictly 8 pages. References may extend to page 9 if necessary.', timestamp: '2026-06-29T12:00:00Z' }
      ],
      timestamp: '2026-06-29T09:40:00Z'
    }
  ],
  surveys: [
    {
      id: 'srv_001',
      conferenceId: 'gacs2026',
      title: 'GACS 2026 Opening Survey',
      questions: [
        { id: 'q1', type: 'rating', text: 'How do you rate the venue and logistics?' },
        { id: 'q2', type: 'choice', text: 'What is your primary interest area?', choices: ['Artificial Intelligence', 'Cybersecurity', 'Both'] },
        { id: 'q3', type: 'text', text: 'What are your suggestions for tomorrow?' }
      ],
      blastCount: 1,
      responses: [
        { id: 'resp1', answers: { q1: 5, q2: 'Artificial Intelligence', q3: 'Great keynote by Dr. Thorne!' } },
        { id: 'resp2', answers: { q1: 4, q2: 'Both', q3: 'The rooms are a bit cold.' } },
        { id: 'resp3', answers: { q1: 5, q2: 'Cybersecurity', q3: 'Smooth check-in process.' } }
      ]
    }
  ],
  networking: {
    messages: [
      { id: 'ch_1', conferenceId: 'gacs2026', fromId: 'usr_author1', toId: 'usr_participant', text: 'Hi Marc, I saw you are interested in deep learning pipelines. Want to catch up near the poster gallery?', timestamp: '2026-07-01T15:00:00Z' },
      { id: 'ch_2', conferenceId: 'gacs2026', fromId: 'usr_participant', toId: 'usr_author1', text: 'Hey Lucas! Yes, absolutely. I read your abstract. Let\'s meet around 3 PM today.', timestamp: '2026-07-01T15:05:00Z' }
    ],
    meetings: [
      {
        id: 'meet_1',
        conferenceId: 'gacs2026',
        hostId: 'usr_author1',
        guestId: 'usr_participant',
        date: '2026-10-13',
        timeSlot: '15:00 - 15:30',
        purpose: 'Discuss sparse matrix optimizations in real-world environments',
        status: 'Approved' // Pending, Approved, Cancelled
      }
    ]
  },
  gallery: [
    {
      id: 'gal_1',
      conferenceId: 'gacs2026',
      uploaderName: 'Lucas Bernard',
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
      caption: 'The main auditorium is packed! Ready for Dr. Thorne\'s talk.',
      approved: true,
      timestamp: '2026-10-12T09:10:00Z'
    },
    {
      id: 'gal_2',
      conferenceId: 'gacs2026',
      uploaderName: 'Marc Dupont',
      url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80',
      caption: 'Coffee break networking!',
      approved: false, // Moderation queue
      timestamp: '2026-10-12T10:45:00Z'
    }
  ],
  votes: [
    { id: 'v1', userId: 'usr_participant', conferenceId: 'gacs2026', category: 'Best Poster', candidateId: 'pos_001' },
    { id: 'v2', userId: 'usr_participant', conferenceId: 'gacs2026', category: 'Best Presentation', candidateId: 'sch_2' }
  ],
  sponsors: [
    {
      id: 'sp_1',
      conferenceId: 'gacs2026',
      name: 'QuantumTech Corp',
      tier: 'Gold', // Gold, Silver, Bronze
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      brochure: 'QuantumTech_Enterprise_Brochure.pdf',
      description: 'QuantumTech is the global leader in quantum annealing and silicon spin-qubit processors. We offer full-stack cloud computing layers for enterprise security and pharmaceutical discovery.',
      contactEmail: 'sponsors@quantumtech.com'
    },
    {
      id: 'sp_2',
      conferenceId: 'gacs2026',
      name: 'CyberGuard Labs',
      tier: 'Gold',
      logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=60',
      videoUrl: '',
      brochure: 'CyberGuard_ZeroTrust_Matrix.pdf',
      description: 'Providing AI-driven endpoint detection and response (EDR). CyberGuard guards more than 5,000 corporate enterprises across Europe.',
      contactEmail: 'booth@cyberguard.com'
    },
    {
      id: 'sp_3',
      conferenceId: 'gacs2026',
      name: 'NetSecure Systems',
      tier: 'Silver',
      logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=60',
      videoUrl: '',
      brochure: '',
      description: 'Next-generation firewalls built for latency-critical hyper-scaler networks.',
      contactEmail: 'contact@netsecure.io'
    }
  ],
  mailingHistory: [
    {
      id: 'm1',
      conferenceId: 'gacs2026',
      senderName: 'Sophie Laurent (POC)',
      subject: 'Welcome to GACS 2026 - Getting Started Guide',
      recipientSegment: 'All Registered Participants',
      sentCount: 9,
      body: '<p>Dear Participant,</p><p>We are thrilled to welcome you to the Global AI & Cyber-Security Summit. Please find attached the schedule outline.</p>',
      timestamp: '2026-10-11T18:00:00Z'
    }
  ]
};

// Database class helper
class MockDatabase {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        let updated = false;
        
        // Migrate topics
        if (!parsed.topics) {
          parsed.topics = [
            { id: 'top_1', conferenceId: 'gacs2026', name: 'Artificial Intelligence', description: 'Neural networks, models, and deep learning.' },
            { id: 'top_2', conferenceId: 'gacs2026', name: 'Cybersecurity', description: 'Threat models, network security, and defense systems.' },
            { id: 'top_3', conferenceId: 'gacs2026', name: 'Quantum Cryptography', description: 'Quantum key distribution, quantum algorithms, and physical layer security.' },
            { id: 'top_4', conferenceId: 'gacs2026', name: 'Natural Language Processing', description: 'Large language models, text parsing, and translation representation.' }
          ];
          updated = true;
        }

        // Migrate evaluationCriteria
        if (!parsed.evaluationCriteria) {
          parsed.evaluationCriteria = [
            { id: 'crit_1', conferenceId: 'gacs2026', name: 'Originality (Originalité)', maxScore: 5 },
            { id: 'crit_2', conferenceId: 'gacs2026', name: 'Methodology (Méthodologie)', maxScore: 5 },
            { id: 'crit_3', conferenceId: 'gacs2026', name: 'Relevance (Pertinence)', maxScore: 5 }
          ];
          updated = true;
        }

        // Migrate surveySubmissions
        if (!parsed.surveySubmissions) {
          parsed.surveySubmissions = [
            { id: 'sur_1', conferenceId: 'gacs2026', userId: 'usr_author1', ratingOrganization: 5, ratingContent: 4, comments: 'Excellent congress experience!' },
            { id: 'sur_2', conferenceId: 'gacs2026', userId: 'usr_author2', ratingOrganization: 4, ratingContent: 5, comments: 'Superb tracks and review quality.' }
          ];
          updated = true;
        }

        // Migrate authorInstructions
        if (parsed.conferences) {
          parsed.conferences = parsed.conferences.map(c => {
            if (!c.authorInstructions) {
              c.authorInstructions = "Veuillez soumettre vos articles au format PDF. Le format Short Paper est limité à 4 pages, le Extended Paper à 8 pages, et le format Poster à une seule page de présentation.";
              updated = true;
            }
            return c;
          });
        }

        // Migrate users with roles array, requiresPasswordChange flag, and segment
        if (parsed.users) {
          const segments = ['Student', 'Lab Chief', 'Diaspora', 'Engineer', 'Industrial'];
          parsed.users = parsed.users.map((u, i) => {
            if (!u.roles) {
              if (u.role === 'PSC') {
                u.roles = ['PSC', 'Reviewer', 'Participant'];
              } else if (u.role === 'Reviewer') {
                u.roles = ['Reviewer', 'Participant'];
              } else {
                u.roles = [u.role];
              }
              updated = true;
            }
            if (u.requiresPasswordChange === undefined) {
              u.requiresPasswordChange = false;
              updated = true;
            }
            if (!u.segment) {
              u.segment = segments[i % segments.length];
              updated = true;
            }
            return u;
          });
        }

        // Migrate papers with topicIds and paperType
        if (parsed.papers) {
          parsed.papers = parsed.papers.map(p => {
            if (!p.paperType) {
              p.paperType = 'Extended Paper';
              updated = true;
            }
            return p;
          });
          if (parsed.papers[0] && !parsed.papers[0].topicIds) {
            parsed.papers[0].topicIds = ['top_1', 'top_4'];
            updated = true;
          }
          if (parsed.papers[1] && !parsed.papers[1].topicIds) {
            parsed.papers[1].topicIds = ['top_2', 'top_3'];
            updated = true;
          }
        }

        // Migrate gallery with status
        if (parsed.gallery) {
          parsed.gallery = parsed.gallery.map(item => {
            if (!item.status) {
              item.status = 'approved';
              updated = true;
            }
            return item;
          });
        }

        // Migrate sponsors with extra fields
        if (parsed.sponsors) {
          parsed.sponsors = parsed.sponsors.map((s, idx) => {
            if (!s.website) {
              s.website = `https://www.${s.name.toLowerCase().replace(/ /g, '')}.com`;
              s.phone = `+33 1 45 ${idx}0 90 ${idx}1`;
              s.socials = {
                linkedin: `https://linkedin.com/company/${s.name.toLowerCase().replace(/ /g, '')}`,
                twitter: `https://twitter.com/${s.name.toLowerCase().replace(/ /g, '')}`
              };
              updated = true;
            }
            return s;
          });
        }

        if (updated) {
          localStorage.setItem(DB_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load localStorage mock db:', e);
    }
    
    // Seed
    const parsedSeed = JSON.parse(JSON.stringify(initialDb));
    parsedSeed.topics = [
      { id: 'top_1', conferenceId: 'gacs2026', name: 'Artificial Intelligence', description: 'Neural networks, models, and deep learning.' },
      { id: 'top_2', conferenceId: 'gacs2026', name: 'Cybersecurity', description: 'Threat models, network security, and defense systems.' },
      { id: 'top_3', conferenceId: 'gacs2026', name: 'Quantum Cryptography', description: 'Quantum key distribution, quantum algorithms, and physical layer security.' },
      { id: 'top_4', conferenceId: 'gacs2026', name: 'Natural Language Processing', description: 'Large language models, text parsing, and translation representation.' }
    ];
    parsedSeed.users = parsedSeed.users.map(u => {
      if (u.role === 'PSC') {
        u.roles = ['PSC', 'Reviewer', 'Participant'];
      } else if (u.role === 'Reviewer') {
        u.roles = ['Reviewer', 'Participant'];
      } else {
        u.roles = [u.role];
      }
      u.requiresPasswordChange = false;
      return u;
    });
    if (parsedSeed.papers[0]) parsedSeed.papers[0].topicIds = ['top_1', 'top_4'];
    if (parsedSeed.papers[1]) parsedSeed.papers[1].topicIds = ['top_2', 'top_3'];
    
    localStorage.setItem(DB_KEY, JSON.stringify(parsedSeed));
    return parsedSeed;
  }

  save() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save localStorage mock db:', e);
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(initialDb));
    this.save();
    return this.data;
  }

  // Generic methods
  getTable(tableName) {
    return this.data[tableName] || [];
  }

  updateTable(tableName, items) {
    this.data[tableName] = items;
    this.save();
    return this.data[tableName];
  }

  // Get current active conference
  getConference(id) {
    return this.getTable('conferences').find(c => c.id === id);
  }

  updateConference(id, updateData) {
    const confs = this.getTable('conferences');
    const idx = confs.findIndex(c => c.id === id);
    if (idx !== -1) {
      confs[idx] = { ...confs[idx], ...updateData };
      this.updateTable('conferences', confs);
    }
    return confs[idx];
  }

  // User RBAC queries
  getUsers(confId) {
    // Return users assigned to conference or superadmin (no conf ID restriction)
    return this.getTable('users').filter(u => !u.conferenceId || u.conferenceId === confId);
  }

  getUser(userId) {
    return this.getTable('users').find(u => u.id === userId);
  }

  createUser(userData) {
    const users = this.getTable('users');
    const newUser = { id: uid(), ...userData };
    users.push(newUser);
    this.updateTable('users', users);
    return newUser;
  }

  // Paper & Versions History
  getPapers(confId) {
    return this.getTable('papers').filter(p => p.conferenceId === confId);
  }

  getPaper(paperId) {
    return this.getTable('papers').find(p => p.id === paperId);
  }

  createPaper(paperData) {
    const papers = this.getTable('papers');
    const newPaper = {
      id: 'pap_' + uid(),
      status: 'Initial Submission',
      versions: [
        {
          version: 'V1',
          timestamp: new Date().toISOString(),
          fileName: paperData.fileName || 'submission.docx',
          fileSize: paperData.fileSize || '1.8 MB'
        }
      ],
      ...paperData
    };
    papers.push(newPaper);
    this.updateTable('papers', papers);
    return newPaper;
  }

  uploadNewVersion(paperId, versionData) {
    const papers = this.getTable('papers');
    const idx = papers.findIndex(p => p.id === paperId);
    if (idx !== -1) {
      const nextVerNum = papers[idx].versions.length + 1;
      papers[idx].versions.push({
        version: `V${nextVerNum}`,
        timestamp: new Date().toISOString(),
        fileName: versionData.fileName || `revision_v${nextVerNum}.pdf`,
        fileSize: versionData.fileSize || '2.0 MB'
      });
      papers[idx].status = 'Revision Submitted'; // Author uploaded a corrected version
      this.updateTable('papers', papers);
      return papers[idx];
    }
    return null;
  }

  // Peer reviews
  getReviewsForPaper(paperId) {
    return this.getTable('reviews').filter(r => r.paperId === paperId);
  }

  submitReview(reviewData) {
    const reviews = this.getTable('reviews');
    const newReview = {
      id: 'rev_' + uid(),
      timestamp: new Date().toISOString(),
      ...reviewData
    };
    reviews.push(newReview);
    this.updateTable('reviews', reviews);

    // If review is submitted, we can also update paper reviewer status logic if needed
    return newReview;
  }

  // Support Tickets
  getTickets(confId) {
    return this.getTable('tickets').filter(t => t.conferenceId === confId);
  }

  createTicket(ticketData) {
    const tickets = this.getTable('tickets');
    const newTicket = {
      id: 'tkt_' + uid(),
      timestamp: new Date().toISOString(),
      status: 'Open',
      replies: [],
      ...ticketData
    };
    tickets.push(newTicket);
    this.updateTable('tickets', tickets);
    return newTicket;
  }

  addTicketReply(ticketId, senderName, replyText) {
    const tickets = this.getTable('tickets');
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      tickets[idx].replies.push({
        id: uid(),
        senderName,
        text: replyText,
        timestamp: new Date().toISOString()
      });
      this.updateTable('tickets', tickets);
      return tickets[idx];
    }
    return null;
  }

  // Surveys
  getSurveys(confId) {
    return this.getTable('surveys').filter(s => s.conferenceId === confId);
  }

  createSurvey(surveyData) {
    const surveys = this.getTable('surveys');
    const newSurvey = {
      id: 'srv_' + uid(),
      responses: [],
      blastCount: 0,
      ...surveyData
    };
    surveys.push(newSurvey);
    this.updateTable('surveys', surveys);
    return newSurvey;
  }

  submitSurveyResponse(surveyId, answerData) {
    const surveys = this.getTable('surveys');
    const idx = surveys.findIndex(s => s.id === surveyId);
    if (idx !== -1) {
      const response = {
        id: 'resp' + uid(),
        answers: answerData
      };
      surveys[idx].responses.push(response);
      this.updateTable('surveys', surveys);
      return response;
    }
    return null;
  }

  // E-Posters comments
  addPosterComment(posterId, userName, commentText) {
    const posters = this.getTable('posters');
    const idx = posters.findIndex(p => p.id === posterId);
    if (idx !== -1) {
      const newComment = {
        id: uid(),
        user: userName,
        text: commentText,
        timestamp: new Date().toISOString()
      };
      posters[idx].comments.push(newComment);
      this.updateTable('posters', posters);
      return newComment;
    }
    return null;
  }

  // Public voting system
  castVote(userId, confId, category, candidateId) {
    const votes = this.getTable('votes');
    // Enforce 1 Vote per User per Category
    const existing = votes.find(v => v.userId === userId && v.conferenceId === confId && v.category === category);
    if (existing) {
      return { success: false, error: 'You have already voted in this category!' };
    }
    const newVote = {
      id: 'v_' + uid(),
      userId,
      conferenceId: confId,
      category,
      candidateId
    };
    votes.push(newVote);
    this.updateTable('votes', votes);
    return { success: true, vote: newVote };
  }

  // Networking Chat
  getChatMessages(confId) {
    return this.data.networking.messages.filter(m => m.conferenceId === confId);
  }

  sendChatMessage(messageData) {
    const msg = {
      id: 'ch_' + uid(),
      timestamp: new Date().toISOString(),
      ...messageData
    };
    this.data.networking.messages.push(msg);
    this.save();
    return msg;
  }

  getMeetings(confId) {
    return this.data.networking.meetings.filter(m => m.conferenceId === confId);
  }

  createMeeting(meetingData) {
    const meet = {
      id: 'meet_' + uid(),
      status: 'Pending',
      ...meetingData
    };
    this.data.networking.meetings.push(meet);
    this.save();
    return meet;
  }

  updateMeetingStatus(meetingId, status) {
    const idx = this.data.networking.meetings.findIndex(m => m.id === meetingId);
    if (idx !== -1) {
      this.data.networking.meetings[idx].status = status;
      this.save();
      return this.data.networking.meetings[idx];
    }
    return null;
  }

  // ─── Authentication Methods ───────────────────────────────────────────────

  validateCredentials(email, password) {
    const user = this.getTable('users').find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, error: 'Invalid email or password.' };
    if (user.status === 'pending') return { success: false, error: 'pending', user };
    if (user.status === 'suspended') return { success: false, error: 'Account has been suspended. Contact the administrator.' };
    return { success: true, user };
  }

  registerUser(userData) {
    const users = this.getTable('users');
    // Check unique email
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    const newUser = {
      id: 'usr_' + uid(),
      status: 'pending',   // Requires admin activation
      role: userData.role || 'Participant',
      roles: [userData.role || 'Participant'],
      requiresPasswordChange: false,
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
      attribute: userData.attribute || 'Participant',
      topics: [],
      registeredAt: new Date().toISOString(),
      ...userData
    };
    users.push(newUser);
    this.updateTable('users', users);
    return { success: true, user: newUser };
  }

  getPendingUsers(confId) {
    return this.getTable('users').filter(
      u => u.status === 'pending' && (!confId || u.conferenceId === confId || u.role === 'Superadmin')
    );
  }

  activateUser(userId) {
    const users = this.getTable('users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].status = 'active';
      users[idx].activatedAt = new Date().toISOString();
      this.updateTable('users', users);
      return users[idx];
    }
    return null;
  }

  suspendUser(userId) {
    const users = this.getTable('users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].status = 'suspended';
      this.updateTable('users', users);
      return users[idx];
    }
    return null;
  }

  deleteUser(userId) {
    const users = this.getTable('users').filter(u => u.id !== userId);
    this.updateTable('users', users);
  }

  updateUserPassword(userId, newPassword) {
    const users = this.getTable('users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].password = newPassword;
      this.updateTable('users', users);
      return true;
    }
    return false;
  }

  completeUserPasswordChange(userId, newPassword) {
    const users = this.getTable('users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].password = newPassword;
      users[idx].requiresPasswordChange = false;
      this.updateTable('users', users);
      return true;
    }
    return false;
  }

  // ─── Topics CRUD Methods ────────────────────────────────────────────────
  getTopics(confId) {
    return this.getTable('topics').filter(t => !confId || t.conferenceId === confId);
  }

  createTopic(topicData) {
    const topics = this.getTable('topics');
    const newTopic = {
      id: 'top_' + uid(),
      ...topicData
    };
    topics.push(newTopic);
    this.updateTable('topics', topics);
    return newTopic;
  }

  updateTopic(topicId, updateData) {
    const topics = this.getTable('topics');
    const idx = topics.findIndex(t => t.id === topicId);
    if (idx !== -1) {
      topics[idx] = { ...topics[idx], ...updateData };
      this.updateTable('topics', topics);
      return topics[idx];
    }
    return null;
  }

  deleteTopic(topicId) {
    const topics = this.getTable('topics').filter(t => t.id !== topicId);
    this.updateTable('topics', topics);
  }

  // ─── Master Submissions CRUD for PSC ──────────────────────────────────────
  createPaper(paperData) {
    const papers = this.getTable('papers');
    const newPaper = {
      id: 'pap_' + uid(),
      status: 'Awaiting Assignment',
      versions: [{
        version: 'V1',
        timestamp: new Date().toISOString(),
        fileName: 'manuscript_draft.pdf',
        fileSize: '1.5 MB'
      }],
      reviewerIds: [],
      topicIds: [],
      ...paperData
    };
    papers.push(newPaper);
    this.updateTable('papers', papers);
    return newPaper;
  }

  updatePaper(paperId, updateData) {
    const papers = this.getTable('papers');
    const idx = papers.findIndex(p => p.id === paperId);
    if (idx !== -1) {
      papers[idx] = { ...papers[idx], ...updateData };
      this.updateTable('papers', papers);
      return papers[idx];
    }
    return null;
  }

  deletePaper(paperId) {
    const papers = this.getTable('papers').filter(p => p.id !== paperId);
    this.updateTable('papers', papers);
  }

  // promote participant to reviewer
  promoteParticipantToReviewer(userId) {
    const users = this.getTable('users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const user = users[idx];
      if (!user.roles) user.roles = [user.role];
      if (!user.roles.includes('Reviewer')) {
        user.roles.push('Reviewer');
      }
      users[idx] = user;
      this.updateTable('users', users);
      return user;
    }
    return null;
  }

  // create user account manually by PSC with temporary password
  adminCreateUser(userData) {
    const users = this.getTable('users');
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    const newUser = {
      id: 'usr_' + uid(),
      status: 'active', // Admin created are active by default
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
      attribute: userData.role || 'Participant',
      topics: [],
      registeredAt: new Date().toISOString(),
      roles: [userData.role],
      requiresPasswordChange: true, // Key requirement: forces password change on first login
      ...userData
    };
    users.push(newUser);
    this.updateTable('users', users);
    return { success: true, user: newUser };
  }

  // ─── Evaluation Criteria CRUD ───────────────────────────────────────────
  getEvaluationCriteria(confId) {
    return this.getTable('evaluationCriteria').filter(c => !confId || c.conferenceId === confId);
  }

  createEvaluationCriterion(critData) {
    const criteria = this.getTable('evaluationCriteria');
    const newCrit = {
      id: 'crit_' + uid(),
      ...critData
    };
    criteria.push(newCrit);
    this.updateTable('evaluationCriteria', criteria);
    return newCrit;
  }

  updateEvaluationCriterion(critId, updateData) {
    const criteria = this.getTable('evaluationCriteria');
    const idx = criteria.findIndex(c => c.id === critId);
    if (idx !== -1) {
      criteria[idx] = { ...criteria[idx], ...updateData };
      this.updateTable('evaluationCriteria', criteria);
      return criteria[idx];
    }
    return null;
  }

  deleteEvaluationCriterion(critId) {
    const criteria = this.getTable('evaluationCriteria').filter(c => c.id !== critId);
    this.updateTable('evaluationCriteria', criteria);
  }

  // ─── Survey Submissions ──────────────────────────────────────────────────
  submitSurvey(surveyData) {
    const submissions = this.getTable('surveySubmissions') || [];
    const newSub = {
      id: 'sur_' + uid(),
      timestamp: new Date().toISOString(),
      ...surveyData
    };
    submissions.push(newSub);
    this.updateTable('surveySubmissions', submissions);
    return newSub;
  }

  // ─── Gallery Live Uploads & Moderation ───────────────────────────────────
  submitGalleryPhoto(photoData) {
    const gallery = this.getTable('gallery');
    const newPhoto = {
      id: 'gal_' + uid(),
      status: 'pending', // Awaiting approval
      likes: 0,
      timestamp: new Date().toISOString(),
      ...photoData
    };
    gallery.push(newPhoto);
    this.updateTable('gallery', gallery);
    return newPhoto;
  }

  approveGalleryPhoto(photoId) {
    const gallery = this.getTable('gallery');
    const idx = gallery.findIndex(item => item.id === photoId);
    if (idx !== -1) {
      gallery[idx].status = 'approved';
      this.updateTable('gallery', gallery);
      return gallery[idx];
    }
    return null;
  }

  deleteGalleryPhoto(photoId) {
    const gallery = this.getTable('gallery').filter(item => item.id !== photoId);
    this.updateTable('gallery', gallery);
  }

  // ─── Author Guidelines / Instructions ────────────────────────────────────
  updateConferenceGuidelines(confId, guidelines) {
    const conferences = this.getTable('conferences');
    const idx = conferences.findIndex(c => c.id === confId);
    if (idx !== -1) {
      conferences[idx].authorInstructions = guidelines;
      this.updateTable('conferences', conferences);
      return true;
    }
    return false;
  }

  // ─── Networking Confirmation Hooks ────────────────────────────────────────
  acceptMeeting(meetingId) {
    const networking = this.data.networking || { messages: [], meetings: [] };
    const idx = networking.meetings.findIndex(m => m.id === meetingId);
    if (idx !== -1) {
      networking.meetings[idx].status = 'confirmed';
      this.data.networking = networking;
      this.save();
      return true;
    }
    return false;
  }

  declineMeeting(meetingId) {
    const networking = this.data.networking || { messages: [], meetings: [] };
    const idx = networking.meetings.findIndex(m => m.id === meetingId);
    if (idx !== -1) {
      networking.meetings[idx].status = 'declined';
      this.data.networking = networking;
      this.save();
      return true;
    }
    return false;
  }

  // ─── Sponsor Information Upgrades ────────────────────────────────────────
  updateSponsorInfo(sponsorId, updateData) {
    const sponsors = this.getTable('sponsors');
    const idx = sponsors.findIndex(s => s.id === sponsorId);
    if (idx !== -1) {
      sponsors[idx] = { ...sponsors[idx], ...updateData };
      this.updateTable('sponsors', sponsors);
      return sponsors[idx];
    }
    return null;
  }

  // ─── PSC Review Dispatch ──────────────────────────────────────────────────
  dispatchReviewReport(paperId, pscNote, senderName) {
    const papers = this.getTable('papers');
    const idx = papers.findIndex(p => p.id === paperId);
    if (idx !== -1) {
      papers[idx].status = 'Review Dispatched';
      papers[idx].reviewDispatchedAt = new Date().toISOString();
      papers[idx].pscValidationNote = pscNote || '';
      this.updateTable('papers', papers);

      // Log simulated email to author
      const mailingHistory = this.getTable('mailingHistory');
      mailingHistory.push({
        id: 'm_' + uid(),
        conferenceId: papers[idx].conferenceId,
        senderName: senderName || 'PSC',
        subject: `Rapport d'Évaluation — ${papers[idx].title.slice(0, 50)}`,
        recipientSegment: papers[idx].authors[0]?.email || 'Author',
        body: `Cher(e) auteur(e), le rapport d'évaluation de votre soumission "${papers[idx].title}" a été validé et envoyé par le Comité Scientifique. Vous pouvez désormais soumettre une version corrigée depuis votre espace de travail.`,
        sentCount: 1,
        paperId,
        timestamp: new Date().toISOString()
      });
      this.updateTable('mailingHistory', mailingHistory);
      return papers[idx];
    }
    return null;
  }
}

export const dbInstance = new MockDatabase();

