import React, { useState, useRef, useEffect } from "react";
import alumniconnectlogo2 from "../../assets/alumniconnectlogo2.png";
import chatbotsymbol from "../../assets/chatbot.png";
import chatbotimage from "../../assets/chatbotimage.jpg";

function Chatbot() {
  const [step, setStep] = useState(1);
  const [conversation, setConversation] = useState([]);
  const [stepHistory, setStepHistory] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);

  // Ref for chat container
  const chatContainerRef = useRef(null);

  // Define custom results for each option
  const results = {
    // Navigation
    Home: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Home Page: Click on the 'Home' tab in the navigation bar.",
      "3. View the Landing Page: The homepage will display the platform's Mission & Vision statements, along with links to the various pages available.",
    ],

    Alumni: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Alumni Page: Click on the 'Alumni' tab in the navigation bar or scroll through the home page to find the “Alumni” link.",
      "3. View the Alumni Page: You may search, sort, and filter the list of alumni according to your preferences. In this page, the primary information, secondary information, educational background, career background, contact information, and attachment/s of alumni are available.",
    ],

    Survey: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Survey Page: Click on the 'Survey' tab in the navigation bar or scroll through the home page to find the “Survey” link.",
      "3. View the Survey Page: You can view and answer the survey questions published by the admins.",
    ],

    Content: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Contents Page: Click on the 'Contents' tab in the navigation bar, which will display a dropdown menu including: Companies, News, Events, Certifications, Document Request Steps, and Job/Internship Referrals or scroll through the home page to find links for each content.",
      "3. View the Contents Page: Each content page will include information such as the name, description, address, image, and contact details for the Company, News, Event, Certification, Document, or Job.",
    ],

    Chatbot: [
      "1. Sign In: Enter your registered credentials (username and password) to log in to the system.",
      "2. Navigate to Chatbot Page: Click on the 'Chatbot' tab in the navigation bar or scroll through the home page to find the “Chatbot” link.",
      "3. View the Chatbot Page: Click the 'Get Started' button, and the inquiry options will be displayed. You can inquire about platform navigation, colleges, jobs, and information about different colleges; however, there will be no option to chat live with an administrator.",
    ],

    // Jobs
    Accountancy: [
      "1. Accounting Assistant",
      "2. Accounting Clerk",
      "3. Account Manager",
      "4. Accountant",
      "5. Financial Planner",
      "6. Financial Adviser",
      "7. Business Analyst",
      "8. Investment Adviser",
      "9. Financial Modeler",
      "10. Actuary",
    ],

    Architecture: [
      "1. Graphic Designer",
      "2. Framer",
      "3. Project Coordinator",
      "4. Interior Designer",
      "5. Lighting Consultant",
      "6. CAD Designer",
      "7. Professor",
      "8. Architectural Drafter",
      "9. Restoration Manager",
      "10. Architectural Technologist",
      "11. Archivist",
      "12. Industrial Designer",
      "13. Landscape Architect",
      "14. Urban Planner",
      "15. Structural Designer",
      "16. Building Architect",
      "17. Project Manager",
      "18. CAD Detailer",
      "19. Architectural Historian",
      "20. Researcher",
      "21. Structural Engineer",
      "22. Architect",
    ],

    "Arts and Letters": [
      "1. Production Assistant",
      "2. Admissions Counselor",
      "3. Event Planner",
      "4. Author",
      "5. Journalist",
      "6. Social Media Manager",
      "7. Graphic Designer",
      "8. Copywriter",
      "9. Interior Designer",
      "10. Marketing Specialist",
      "11. Art Director",
      "12. Web Developer",
      "13. Sales Manager",
      "14. Economist",
    ],

    "Civil Law": [
      "1. Mediator",
      "2. Paralegal",
      "3. Compliance Officer",
      "4. Legal Administrative Assistant",
      "5. Lawyer",
      "6. Judge",
      "7. Jury Consultant",
      "8. Law Enforcement Officer",
      "9. Law Librarian",
      "10. Accountant",
      "11. Financial Analyst",
      "12. Consultant",
      "13. Court Reporter",
      "14. General Counsel",
      "15. Human Resource Manager",
      "16. Journalism",
      "17. Law Professor",
      "18. Legal Consultant",
      "19. Legal Editor",
      "20. Lobbyist",
    ],

    "Commerce and Business Administration": [
      "1. Accountant",
      "2. Actuary",
      "3. Business Consultant",
      "4. Business Manager",
      "5. Chief Executive Officer",
      "6. Chief Financial Officer",
      "7. Chief Operating Officer",
      "8. Data Analyst",
      "9. Director of Operations",
      "10. Financial Analyst",
      "11. Health Services Administrator",
      "12. Human Resources Specialist",
      "13. Logistics Manager",
      "14. Management Consultant",
      "15. Market Research Analyst",
      "16. Marketing Manager",
      "17. Office Manager",
      "18. Project Manager",
      "19. Sales Manager",
      "20. Senior Business Analyst",
    ],

    Education: [
      "1. Career Counselor",
      "2. Academic Coach",
      "3. Camp Director",
      "4. Student Coordinator",
      "5. Child Care Director",
      "6. Lifestyle Coach",
      "7. Substance Abuse Counselor",
      "8. Corporate Trainer",
      "9. School Counselor",
      "10. School Psychologist",
      "11. Tutor",
      "12. Librarian",
      "13. Freelance Writer",
      "14. Associate Editor",
      "15. Educational Consultant",
      "16. Instructional Designer",
      "17. School Principal",
    ],

    Engineering: [
      "1. Marine Engineer",
      "2. Industrial Engineer",
      "3. Mechanical Engineer",
      "4. Computer Engineer",
      "5. Chemical Engineer",
      "6. Biomedical Engineer",
      "7. Petroleum Engineer",
      "8. Civil Engineer",
      "9. Environmental Engineer",
      "10. Electrical Engineer",
      "11. Nuclear Engineer",
      "12. Aeronautical Engineer",
      "13. Materials Engineer",
      "14. Software Engineer",
    ],

    "Fine Arts and Design": [
      "1. Music Director",
      "2. Illustrator",
      "3. Photographer",
      "4. Animator",
      "5. Web Designer",
      "6. Graphic Designer",
      "7. Art Teacher",
      "8. Musician",
      "9. Fashion Designer",
      "10. Curator",
      "11. Artist",
      "12. Interior Designer",
      "13. Writer",
      "14. Video Game Designer",
      "15. Art Director",
      "16. Videographer",
      "17. Concept Artist",
      "18. User Interface (UI) Designer",
      "19. UX Designer",
      "20. Architect",
      "21. Actor",
      "22. Printmaker",
      "23. Creative Writer",
      "24. Director",
      "25. Film Sound Editor",
      "26. Art Agent",
      "27. Band Manager",
      "28. Sound Engineer",
      "29. Commercial Artist",
      "30. Multimedia Artist",
      "31. Freelance Writer",
      "32. Advertising Designer",
      "33. Multimedia Artist",
      "34. Conservator",
      "35. Exhibition Designer",
      "36. Advertising Art Director",
      "37. Art Therapist",
      "38. Community Arts Worker",
      "39. Commercial Art Gallery Manager",
      "40. Museum Exhibitions Officer",
      "41. Arts Administrator",
      "42. Vfx Artist",
      "43. Craft Artist",
      "44. Special Effects Technician",
      "45. Community Arts Worker",
      "46. Fine Artist",
    ],

    "Information and Computing Sciences": [
      "1. Animator",
      "2. Health Information Technician",
      "3. Webmaster",
      "4. Computer Programmer",
      "5. Web Developer",
      "6. Computer Systems Analyst",
      "7. Business Analyst",
      "8. Video Game Designer",
      "9. Information Security Analyst",
      "10. Computer Engineer",
      "11. Application Developer",
      "12. Database Administrator",
      "13. Knowledge Engineer",
      "14. Software Test Engineer",
      "15. UX Designer",
      "16. Computer and Information Systems Manager",
      "17. Software Developer",
      "18. Software Engineer",
      "19. Cloud Engineer",
      "20. Data Scientist",
      "21. Computer Network Architect",
    ],

    "Medicine and Surgery": [
      "1. Dietary Aide",
      "2. Home Health Aide",
      "3. Veterinary Assistant",
      "4. Medical Records Clerk",
      "5. Patient Care Technician",
      "6. Nursing Assistant",
      "7. Certified Nursing Assistant",
      "8. Medical Scribe",
      "9. Medical Receptionist",
      "10. Medical Assistant",
      "11. Medical Secretary",
      "12. Athletic Trainer",
      "13. Licensed Practical Nurse",
      "14. Nutritionist",
      "15. Registered Nurse",
      "16. Health Administrator",
      "17. Ultrasound Technician",
      "18. Physical Therapist",
      "19. Audiologist",
      "20. Occupational Therapist",
      "21. Director of Nursing",
      "22. Neonatal Nurse",
      "23. Veterinarian",
      "24. Pharmacist",
      "25. Pediatrician",
      "26. Dentist",
      "27. Physician",
      "28. Surgeon",
      "29. Medical Director",
      "30. Psychiatrist",
      "31. Chief Medical Officer",
      "32. Anesthesiologist",
    ],

    Music: [
      "1. Actor",
      "2. Production Assistant",
      "3. Sound Engineer",
      "4. Public Relations Assistant",
      "5. Social Media Coordinator",
      "6. Event Coordinator",
      "7. Theater Manager",
      "8. Librarian",
      "9. Music Teacher",
      "10. Disc Jockey (DJ)",
      "11. Piano Teacher",
      "12. Music Director",
      "13. Music Minister",
      "14. Promotions Coordinator",
      "15. Musician",
      "16. Studio Manager",
      "17. Specialist Tours Manager",
      "18. Merchandise Manager",
      "19. Recruiter",
      "20. Media Manager",
      "21. Professor",
      "22. Historian",
    ],

    Nursing: [
      "1. Nurse Health Coach",
      "2. Nurse Nutritionist",
      "3. Medical Claims Analyst",
      "4. Public Health Nurse",
      "5. Hospice Nurse",
      "6. Nurse Educator",
      "7. Health Services Director",
      "8. Home Care Nurse",
      "9. Legal Nurse Consultant",
      "10. Medical Writer",
      "11. Nurse Case Manager",
      "12. Nurse Midwife",
      "13. Nurse Practitioner",
      "14. Emergency Room Nurse",
      "15. Oncology Nurse",
      "16. Nurse Anesthetist",
    ],

    Pharmacy: [
      "1. Pharmacy Clerk",
      "2. Pharmacy Dispenser",
      "3. Pharmacy Assistant",
      "4. Pharmacy Technician",
      "5. Pharmacist",
      "6. Chemotherapy Pharmacist",
      "7. Nuclear Pharmacist",
      "8. Long-Term Care Pharmacists",
      "9. Staff Pharmacist",
      "10. Director of Pharmacy",
      "11. Pharmacist in Charge",
      "12. Pharmacy Manager",
      "13. Pharmacy Specialist",
      "14. Clinical Pharmacist",
      "15. Health Outcomes Pharmacist",
      "16. Pharmacologist",
    ],

    "Physical Education and Athletics": [
      "1. Dance Instructor",
      "2. Athletic Coach",
      "3. Sport Journalist",
      "4. Athletic Trainer",
      "5. Physical Education Teacher",
      "6. Sports Dietitian",
      "7. Fitness Instructor",
      "8. Senior Fitness Instructor",
      "9. Physical Therapist",
      "10. Occupational Therapist",
    ],

    "Rehabilitation Sciences": [
      "1. Case Manager",
      "2. Clinical Research Coordinator",
      "3. Design Engineer",
      "4. Occupational Therapist",
      "5. Physical Therapist",
      "6. Rehabilitation Director",
      "7. Speech Pathologist",
      "8. Rehab RN",
    ],

    Science: [
      "1. Forensic Science Technician",
      "2. Biochemical Technician",
      "3. Nuclear Technician",
      "4. Microbiologist",
      "5. Meteorologist",
      "6. Chemical Engineer",
      "7. Environmental Scientist",
      "8. Geologist",
      "9. Laboratory Manager",
      "10. Cartographer",
      "11. Geographer",
      "12. Molecular Technical Supervisor",
      "13. Ecologist",
      "14. Geotechnical Engineer",
      "15. Hydrologist",
      "16. Molecular Biologist",
      "17. Computational Biologist",
      "18. Epidemiologist",
      "19. Environmental Engineer",
      "20. Regulatory Medicine Veterinarian",
      "21. Research Chemist",
      "22. Biomedical Engineer",
      "23. Life Science Consultant",
      "24. Oceanographer",
      "25. Materials Engineer",
      "26. Medical Scientist",
      "27. Aeronautical Engineer",
      "28. Pharmacy Manager",
      "29. Geophysicist",
      "30. Pharmacist",
      "31. Medical Research Scientist",
      "32. Astronomer",
      "33. Nuclear Physicist",
      "34. Biostatistician",
      "35. Neurologist",
    ],

    "Tourism and Hospitality Management": [
      "1. Cruise Agent",
      "2. Sports Center Manager",
      "3. Food Truck Manager",
      "4. Pastry Chef",
      "5. Airport Manager",
      "6. Spa Manager",
      "7. Hotel Assistant General Manager",
      "8. Tour Manager",
      "9. Cafe Manager",
      "10. Activity Manager",
      "11. Hotel Sales Coordinator",
      "12. Resort Manager",
      "13. Travel Agent",
      "14. Catering Manager",
      "15. Entertainment Manager",
      "16. Guest Services Manager",
      "17. Director of Housekeeping",
      "18. Park Manager",
      "19. Food Service Director",
      "20. Travel Consultant",
    ],

    "Canon Law": [
      "1. Canon Lawyer (Advocate)",
      "2. Church Tribunal Official",
      "3. Canonical Consultant",
      "4. Parish Administrator",
      "5. Professor of Canon Law",
      "6. Director of Pastoral Care",
      "7. Canonical Auditor",
      "8. Church Administrator",
      "9. Missionary or Chaplain",
      "10. Advocate for Church Reform",
      "11. Researcher or Writer",
      "12. Clerical Positions (e.g., Priest, Bishop)",
      "13. Mediation and Conflict Resolution Specialist",
    ],

    Philosophy: [
      "1. Teacher",
      "2. Paralegal",
      "3. Marketing Consultant",
      "4. Research Consultant",
      "5. Data Analyst",
      "6. Professor",
      "7. Lawyer",
      "8. Health Services Administrator",
      "9. Journalist",
      "10. Psychologist",
    ],

    "Sacred Theology": [
      "1. Music Minister",
      "2. Nonprofit Coordinator",
      "3. Manager of Volunteer Services",
      "4. Youth Pastor",
      "5. Religious Education Teacher",
      "6. Missionary",
      "7. Journalist",
      "8. Pastor",
      "9. Community Organizer",
      "10. Writer",
      "11. Librarian",
      "12. Chaplain",
      "13. Program Director",
      "14. Development Director",
      "15. Religion Professor",
    ],

    "UST-Alfredo M. Velayo College of Accountancy Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F Albertus Magnus Building, Ruaño Drive",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1612, +63-2-3406-1611 local 8372",
    ],
    "College of Architecture Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F Beato Angelico Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-8740-9721, +63-2-3406-1611 local 8229 / 4491, +63-2-8731-4343",
    ],
    "Faculty of Arts and Letters Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F St. Raymund de Peñafort Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8220",
    ],
    "Faculty of Civil Law Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 1/F Main Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-8731-4027, +63-2-3406-1611 local 8225",
    ],
    "College of Commerce and Business Administration Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 4/F St. Raymund of Peñafort Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8258 / 8272, +63-2-8731-3124",
    ],
    "College of Education Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 3/F Albertus Magnus Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-8731-4323, +63-2-3406-1611 local 8260, +63-2-8786-1611 local 8392",
    ],
    "Faculty of Engineering Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F Roque Ruaño Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8275, +63-2-8731-4041",
    ],
    "College of Fine Arts and Design Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F Beato Angelico Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-8740-9703, +63-2-3406-1600, +63-2-3406-1611 local 8390 / 8800",
    ],
    "College of Information and Computing Sciences Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F Blessed Pier Giorgio Frassati Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8518",
    ],
    "Faculty of Medicine and Surgery Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F St. Martin de Porres Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-8741-5314, +63-2-3406-1611 local 8239 / 8244",
    ],
    "Conservatory of Music Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 5/F Albertus Magnus Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8246, +63-2-8731-3124",
    ],
    "College of Nursing Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 3/F St. Martin de Porres Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8241, +63-2-8731-5738",
    ],
    "Faculty of Pharmacy Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F Main Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8223, +63-2-8731-4040",
    ],
    "Institute of Physical Education and Athletics Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F Quadricentennial Pavilion",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8227",
    ],
    "College of Rehabilitation Sciences Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 2/F San Martin de Porres Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8280, +63-2-8740-9713",
    ],
    "College of Science Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 3/F Main Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-8731-5728, +63-2-3406-1611 local 8224 / 8532, +63-2-8740-9730",
    ],
    "College of Tourism and Hospitality Management Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> 8/F Buenaventura G. Paredes, O.P. Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8531 / 4488, +63-2-8732-0188",
    ],
    "Faculty of Canon Law Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> Ground Floor, Central Seminary Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8261",
    ],
    "Faculty of Philosophy Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> Ground Floor, Central Seminary Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8261",
    ],
    "Faculty of Sacred Theology Office": [
      "<strong><i class='fas fa-university'></i> Campus Location:</strong> University of Santo Tomas, España Boulevard, Sampaloc, Manila 1008, Philippines",
      "<strong><i class='fas fa-building'></i> Location:</strong> Ground Floor, Central Seminary Building",
      "<strong><i class='fas fa-phone'></i> Contact Details:</strong> +63-2-3406-1611 local 8261",
    ],

    "UST-Alfredo M. Velayo College of Accountancy": [
      "Bachelor of Science in Accountancy",
      "Bachelor of Science in Accounting Information System",
      "Bachelor of Science in Management Accounting",
    ],
    "College of Architecture": ["Bachelor of Science in Architecture"],
    "Faculty of Arts and Letters": [
      "Bachelor of Arts in Asian Studies",
      "Bachelor of Arts in Behavioral Science",
      "Bachelor of Arts in Communication",
      "Bachelor of Arts in Creative Writing",
      "Bachelor of Arts in Economics",
      "Bachelor of Arts in English Language Studies",
      "Bachelor of Arts in History",
      "Bachelor of Arts in Journalism",
      "Bachelor of Arts in Legal Management",
      "Bachelor of Arts in Literature",
      "Bachelor of Arts in Philosophy",
      "Bachelor of Arts in Political Science",
      "Bachelor of Arts in Sociology",
    ],
    "Faculty of Civil Law": ["Juris Doctor"],
    "College of Commerce and Business Administration": [
      "Bachelor of Science in Business Administration, major in Business Economics",
      "Bachelor of Science in Business Administration, major in Financial Management",
      "Bachelor of Science in Business Administration, major in Human Resource Management",
      "Bachelor of Science in Business Administration, major in Marketing Management",
      "Bachelor of Science in Entrepreneurship",
    ],
    "College of Education": [
      "Bachelor of Secondary Education, major in English",
      "Bachelor of Secondary Education, major in Filipino",
      "Bachelor of Secondary Education, major in Mathematics",
      "Bachelor of Secondary Education, major in Religious and Values Education",
      "Bachelor of Secondary Education, major in Science",
      "Bachelor of Secondary Education, major in Social Studies",
      "Bachelor of Early Childhood Education",
      "Bachelor of Elementary Education",
      "Bachelor of Special Needs Education, major in Early Childhood Education",
      "Bachelor of Science in Food Technology",
      "Bachelor of Science in Nutrition and Dietetics",
      "Bachelor of Library and Information Science",
    ],
    "Faculty of Engineering": [
      "Bachelor of Science in Chemical Engineering",
      "Bachelor of Science in Civil Engineering",
      "Bachelor of Science in Electrical Engineering",
      "Bachelor of Science in Electronics Engineering",
      "Bachelor of Science in Industrial Engineering",
      "Bachelor of Science in Mechanical Engineering",
    ],
    "College of Fine Arts and Design": [
      "Bachelor of Fine Arts, major in Advertising Arts",
      "Bachelor of Fine Arts, major in Industrial Design",
      "Bachelor of Science in Interior Design",
      "Bachelor of Fine Arts, major in Painting",
    ],
    "College of Information and Computing Sciences": [
      "Bachelor of Science in Computer Science",
      "Bachelor of Science in Information Systems",
      "Bachelor of Science in Information Technology",
    ],
    "Faculty of Medicine and Surgery": [
      "Bachelor of Science in Basic Human Studies",
      "Doctor of Medicine",
      "Master in Clinical Audiology",
      "Master in Pain Management",
    ],
    "Conservatory of Music": [
      "Bachelor of Music in Performance, major in Bassoon",
      "Bachelor of Music in Performance, major in Choral Conducting",
      "Bachelor of Music in Performance, major in Clarinet",
      "Bachelor of Music in Composition",
      "Bachelor of Music in Performance, major in Double Bass",
      "Bachelor of Music in Performance, major in Flute",
      "Bachelor of Music in Performance, major in French Horn",
      "Bachelor of Music in Performance, major in Guitar",
      "Bachelor of Music in Jazz",
      "Bachelor of Music in Musicology",
      "Bachelor of Music in Music Education",
      "Bachelor of Music in Music Theatre",
      "Bachelor of Music in Music Technology",
      "Bachelor of Music in Performance, major in Oboe",
      "Bachelor of Music in Performance, major in Orchestral Conducting",
      "Bachelor of Music in Performance, major in Percussion",
      "Bachelor of Music in Performance, major in Piano",
      "Bachelor of Music in Performance, major in Saxophone",
      "Bachelor of Music in Performance, major in Trombone",
      "Bachelor of Music in Performance, major in Trumpet",
      "Bachelor of Music in Performance, major in Tuba",
      "Bachelor of Music in Performance, major in Viola",
      "Bachelor of Music in Performance, major in Violin",
      "Bachelor of Music in Performance, major in Violoncello",
      "Bachelor of Music in Performance, major in Voice",
    ],
    "College of Nursing": ["Bachelor of Science in Nursing"],
    "Faculty of Pharmacy": [
      "Faculty of Pharmacy",
      "Bachelor of Science in Biochemistry",
      "Bachelor of Science in Medical Technology",
      "Bachelor of Science in Pharmacy",
      "Bachelor of Science in Pharmacy, major in Clinical Pharmacy",
      "Doctor of Pharmacy",
    ],
    "Institute of Physical Education and Athletics": [
      "Bachelor of Science in Fitness and Sports Management",
    ],
    "College of Rehabilitation Sciences": [
      "Bachelor of Science in Occupational Therapy",
      "Bachelor of Science in Physical Therapy",
      "Bachelor of Science in Speech-Language Pathology",
      "Bachelor of Science in Sports Science",
    ],
    "College of Science": [
      "Bachelor of Science in Applied Mathematics, major in Actuarial Science",
      "Bachelor of Science in Applied Physics, major in Instrumentation",
      "Bachelor of Science in Biology, major in Environmental Biology",
      "Bachelor of Science in Biology, major in Medical Biology",
      "Bachelor of Science major in Molecular Biology and Biotechnology",
      "Bachelor of Science in Chemistry",
      "Bachelor of Science in Data Science and Analytics",
      "Bachelor of Science in Microbiology",
      "Bachelor of Science in Psychology",
    ],
    "College of Tourism and Hospitality Management": [
      "Bachelor of Science in Hospitality Management, major in Culinary Entrepreneurship",
      "Bachelor of Science in Hospitality Management, major in Hospitality Leadership",
      "Bachelor of Science in Tourism Management, major in Recreation and Leisure Management",
      "Bachelor of Science in Tourism Management, major in Travel Operation and Service Management",
    ],
    "Faculty of Canon Law": [
      "Doctor of Canon Law",
      "Licentiate in Canon Law",
      "Bachelor of Canon Law",
    ],
    "Faculty of Philosophy": [
      "Doctor of Philosophy",
      "Licentiate in Philosophy",
      "Bachelor of Philosophy (Classical)",
    ],
    "Faculty of Sacred Theology": [
      "Doctor of Sacred Theology",
      "Licentiate in Sacred Theology",
      "Bachelor of Sacred Theology",
    ],
  };

  const addChatMessage = (from, message) => {
    setConversation((prevConversation) => [
      ...prevConversation,
      { from, message },
    ]);
  };

  const goBack = () => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory.pop();
      setStep(previousStep);
      setStepHistory([...stepHistory]);

      // Add "Go back" message for user
      addChatMessage("user", "Go back");

      // Remove last user and chatbot messages
      setConversation((prev) => prev.slice(0, -2));

      // Display options based on previous step
      if (previousStep === 2) {
        addChatMessage("chatbot", "Hi! Please choose an option:");
        addChatMessage("chatbot", [
          "Navigation",
          "Colleges",
          "Jobs",
          "College Office Information",
        ]);
      } else if (previousStep === 3) {
        addChatMessage("chatbot", "You chose:");
        addChatMessage("chatbot", currentOptions); // Restore options from Step 3
      }
    }
  };

  const handleGetStarted = () => {
    addChatMessage("user", "Get Started");
    addChatMessage("chatbot", "Hello CICS Alumni! Please choose an option:");
    addChatMessage("chatbot", [
      "Navigation",
      "Colleges",
      "Jobs",
      "College Office Information",
    ]);
    setStepHistory([1]);
    setStep(2);
  };

  const handleMainOptionClick = (option) => {
    addChatMessage("user", option);
    setStepHistory((prevHistory) => [...prevHistory, step]);
    setStep(3);

    setTimeout(() => {
      addChatMessage("chatbot", `You chose ${option}. Here are your options:`);
      let options = [];
      if (option === "Navigation") {
        options = ["Home", "Alumni", "Survey", "Content", "Chatbot", "Go back"];
      } else if (option === "Jobs") {
        options = [
          "Accountancy",
          "Architecture",
          "Arts and Letters",
          "Civil Law",
          "Commerce and Business Administration",
          "Education",
          "Engineering",
          "Fine Arts and Design",
          "Information and Computing Sciences",
          "Medicine and Surgery",
          "Music",
          "Nursing",
          "Pharmacy",
          "Physical Education and Athletics",
          "Rehabilitation Sciences",
          "Science",
          "Tourism and Hospitality Management",
          "Canon Law",
          "Philosophy",
          "Sacred Theology",
          "Go back",
        ];
      } else if (option === "College Office Information") {
        options = [
          "UST-Alfredo M. Velayo College of Accountancy Office",
          "College of Architecture Office",
          "Faculty of Arts and Letters Office",
          "Faculty of Civil Law Office",
          "College of Commerce and Business Administration Office",
          "College of Education Office",
          "Faculty of Engineering Office",
          "College of Fine Arts and Design Office",
          "College of Information and Computing Sciences Office",
          "Faculty of Medicine and Surgery Office",
          "Conservatory of Music Office",
          "College of Nursing Office",
          "Faculty of Pharmacy Office",
          "Institute of Physical Education and Athletics Office",
          "College of Rehabilitation Sciences Office",
          "College of Science Office",
          "College of Tourism and Hospitality Management Office",
          "Faculty of Canon Law Office",
          "Faculty of Philosophy Office",
          "Faculty of Sacred Theology Office",
          "Go back",
        ];
      } else if (option === "Colleges") {
        options = [
          "UST-Alfredo M. Velayo College of Accountancy",
          "College of Architecture",
          "Faculty of Arts and Letters",
          "Faculty of Civil Law",
          "College of Commerce and Business Administration",
          "College of Education",
          "Faculty of Engineering",
          "College of Fine Arts and Design",
          "College of Information and Computing Sciences",
          "Faculty of Medicine and Surgery",
          "Conservatory of Music",
          "College of Nursing",
          "Faculty of Pharmacy",
          "Institute of Physical Education and Athletics",
          "College of Rehabilitation Sciences",
          "College of Science",
          "College of Tourism and Hospitality Management",
          "Faculty of Canon Law",
          "Faculty of Philosophy",
          "Faculty of Sacred Theology",
          "Go back",
        ];
      }
      setCurrentOptions(options); // Save options for the current step
      addChatMessage("chatbot", options); // Display options for the current step
    }, 500);
  };

  const handleSubOptionClick = (subOption) => {
    if (subOption === "Go back") {
      goBack();
      return;
    }

    addChatMessage("user", subOption);
    setStepHistory((prevHistory) => [...prevHistory, step]);
    setStep(4);

    // Determine the result text based on the selected option
    const result = results[subOption] || `No result found for ${subOption}`;

    setTimeout(() => {
      // Display result text as a chatbot message
      addChatMessage(
        "chatbot",
        `You selected ${subOption}. Here are your results:`
      );

      // If the result is an array, join it with <br /> for line breaks
      const formattedResult = Array.isArray(result)
        ? result
            .map((item) => `<p style="margin-bottom: 10px;">${item}</p>`)
            .join("")
        : result;

      addChatMessage("chatbot", formattedResult); // Ensure result is displayed properly
      addChatMessage("chatbot", ["Go back"]); // Add "Go back" button
    }, 500);
  };

  const handleAskAgain = () => {
    addChatMessage("user", "Ask Again");
    setConversation([]);
    setStepHistory([]);
    handleGetStarted();
  };

  // Scroll to the bottom of the chat container whenever the conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <div className="flex items-center mb-4">
        <img src={chatbotsymbol} alt="Logo" className="w-10 h-10 mr-2" />
        <h1 className="text-2xl font-medium text-gray-700">
          AlumniConnect Chatbot
        </h1>
      </div>
      {/* Chat Container */}
      <div
        className="w-full h-[80vh] bg-white p-6 rounded-lg shadow-lg flex flex-col space-y-4 overflow-auto"
        ref={chatContainerRef}
      >
        {/* Chat Messages */}
        {conversation.map((chat, index) => (
          <div
            key={index}
            className={`flex ${
              chat.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {chat.from === "chatbot" && (
              <img
                src={alumniconnectlogo2}
                alt="Chatbot Avatar"
                className="w-10 h-10 rounded mr-2" // Adjust size and margin as needed
              />
            )}
            <div
              className={`${
                chat.from === "user"
                  ? "bg-gray-400 text-white"
                  : "bg-fgray text-white"
              } rounded-lg p-4 mb-2 max-w-xs`}
            >
              {Array.isArray(chat.message) ? (
                <div className="space-y-2">
                  {chat.message.map((option, idx) => (
                    <button
                      key={idx}
                      className={`btn w-full bg-blue text-white py-2 rounded-lg`}
                      onClick={
                        step === 2
                          ? () => handleMainOptionClick(option)
                          : () => handleSubOptionClick(option)
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: chat.message }} />
              )}
            </div>
          </div>
        ))}

        {/* Start Button for Initial Setup */}
        {/* Start Button for Initial Setup */}
        {step === 1 && (
          <div
            className="relative p-6 rounded-lg shadow-lg text-center h-[62vh] flex flex-col items-center justify-center"
            style={{
              backgroundImage: `url(${chatbotimage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="mb-4 font-bold sm:text-2xl text-xl text-white">
              Welcome to Chatbot! Please click Get Started to continue.
            </div>
            <button
              className="btn bg-gray-600 text-white py-2 px-4 rounded-lg text-xl w-72"
              onClick={handleGetStarted}
            >
              Get Started
            </button>

            {/* Credit Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                fontSize: "14px",
                zIndex: "20",
                textAlign: "right",
              }}
            >
              Photo Courtesy of UST ICS
            </div>
          </div>
        )}

        {/* Final Results and Options */}
        {step === 4 && (
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center mt-4">
              <button
                className="btn bg-green text-white py-2 px-6 rounded-lg"
                onClick={handleAskAgain}
              >
                Ask Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chatbot;
