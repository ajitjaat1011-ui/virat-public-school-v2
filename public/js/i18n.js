/* ============================================================
   Virat Public School — English / Hindi interface
   Static, privacy-friendly translations with no third-party API.
   ============================================================ */
(function () {
  'use strict';

  const HI = {
    // Shared navigation and actions
    'Skip to main content': 'मुख्य सामग्री पर जाएँ',
    'Virat Public School': 'विराट पब्लिक स्कूल',
    'Viratnagar · Kotputli-Behror': 'विराटनगर · कोटपूतली-बहरोड़',
    'Admissions 2026–27': 'प्रवेश 2026–27',
    'Home': 'होम', 'About': 'हमारे बारे में', 'About us': 'हमारे बारे में',
    'Admissions': 'प्रवेश', 'Results': 'परिणाम', 'Notices': 'सूचनाएँ',
    'Gallery': 'गैलरी', 'Faculty': 'शिक्षकगण', 'Holidays': 'अवकाश',
    'Contact': 'संपर्क', 'Parents': 'अभिभावक', 'Parent portal': 'अभिभावक पोर्टल',
    'Parent Portal': 'अभिभावक पोर्टल', 'Admin': 'एडमिन', 'Campus': 'परिसर',
    'Events': 'कार्यक्रम', 'Disclosures': 'प्रकटीकरण', 'Accessibility': 'सुगम्यता',
    'Privacy': 'गोपनीयता', 'Terms': 'शर्तें', 'Info': 'जानकारी', 'Families': 'परिवार',
    'Visit': 'मिलें', 'Call': 'फ़ोन करें', 'Email': 'ईमेल', 'Phone': 'फ़ोन',
    'Loading…': 'लोड हो रहा है…', 'Loading albums…': 'एल्बम लोड हो रहे हैं…',
    'Cancel': 'रद्द करें', 'Close': 'बंद करें', 'Save': 'सहेजें', 'Delete': 'हटाएँ',
    'Edit': 'संपादित करें', 'Show': 'दिखाएँ', 'Hide': 'छिपाएँ', 'Sign in': 'साइन इन करें',
    'Sign out →': 'साइन आउट →', 'Back to home': 'होम पर वापस जाएँ',
    'Back to site': 'वेबसाइट पर वापस जाएँ', '← Back to site': '← वेबसाइट पर वापस जाएँ',
    '← Back to website': '← वेबसाइट पर वापस जाएँ', 'Contact us': 'हमसे संपर्क करें',
    'View →': 'देखें →', 'Manage →': 'प्रबंधित करें →', 'Review →': 'समीक्षा करें →',
    'See all →': 'सभी देखें →', 'Our story →': 'हमारी कहानी →',
    'Apply now': 'अभी आवेदन करें', 'Primary': 'प्राथमिक', 'Accent': 'विशेष', 'Ghost': 'सादा',

    // Homepage
    'Admissions open · 2026–27': 'प्रवेश खुले हैं · 2026–27',
    'A strong education, delivered with': 'मज़बूत शिक्षा, पूरी', 'care.': 'देखभाल के साथ।',
    'Viratnagar’s RBSE-affiliated school for LKG to Class 12—where teachers know every child, families stay connected, and fundamentals come first.': 'विराटनगर का RBSE-संबद्ध विद्यालय, LKG से कक्षा 12 तक—जहाँ शिक्षक हर बच्चे को जानते हैं, परिवार जुड़े रहते हैं और बुनियादी शिक्षा को प्राथमिकता मिलती है।',
    'Start an admission inquiry': 'प्रवेश पूछताछ शुरू करें', 'Discover our school': 'हमारे विद्यालय को जानें',
    'RBSE affiliated': 'RBSE से संबद्ध', 'LKG to Class 12': 'LKG से कक्षा 12',
    'Established 2008': 'स्थापना 2008', 'Small class groups': 'छोटे कक्षा समूह',
    'Why VPS': 'VPS क्यों', 'Built around the child.': 'बच्चे को केंद्र में रखकर बनाया गया।',
    'Consistent teaching, clear expectations, and close communication from the first day of school to the board years.': 'विद्यालय के पहले दिन से बोर्ड कक्षाओं तक निरंतर शिक्षण, स्पष्ट अपेक्षाएँ और परिवार से निकट संवाद।',
    'Students per class': 'प्रति कक्षा विद्यार्थी', 'Smaller groups give teachers time to notice, explain, and support.': 'छोटे समूहों से शिक्षकों को हर बच्चे पर ध्यान देने, समझाने और सहयोग करने का समय मिलता है।',
    'Caring educators': 'संवेदनशील शिक्षक', 'Experienced teachers across foundational, secondary, and senior-secondary years.': 'प्रारंभिक, माध्यमिक और उच्च माध्यमिक स्तरों पर अनुभवी शिक्षक।',
    '18 yrs': '18 वर्ष', 'Trusted locally': 'स्थानीय परिवारों का विश्वास',
    'Serving families across Viratnagar, Kotputli, and the Behror region since 2008.': '2008 से विराटनगर, कोटपूतली और बहरोड़ क्षेत्र के परिवारों की सेवा में।',
    'Stay informed': 'जानकारी से जुड़े रहें', 'School at a glance.': 'विद्यालय एक नज़र में।',
    'Published notices': 'प्रकाशित सूचनाएँ', 'Dates, exams, and updates': 'तिथियाँ, परीक्षाएँ और अपडेट',
    'Photo albums': 'फ़ोटो एल्बम', 'Moments from school life': 'विद्यालय जीवन की झलकियाँ',
    'A simple process': 'सरल प्रक्रिया', 'Ready to visit?': 'विद्यालय देखने के लिए तैयार हैं?',
    'Send a two-minute inquiry. Our office will call within one working day, arrange a campus visit, and guide you through documents and fees.': 'दो मिनट में पूछताछ भेजें। हमारा कार्यालय एक कार्य दिवस में फ़ोन करेगा, परिसर भ्रमण तय करेगा और दस्तावेज़ व शुल्क की जानकारी देगा।',
    'Begin inquiry': 'पूछताछ शुरू करें', 'View fee structure': 'शुल्क संरचना देखें',
    'Recent moments': 'हाल की झलकियाँ', 'Nearly two decades of steady work': 'लगभग दो दशकों की निरंतर सेवा',
    'Small enough to know each student': 'हर विद्यार्थी को जानने जितना आत्मीय विद्यालय',
    'We combine serious academic preparation with the warmth, attention, and accountability of a close school community.': 'हम गंभीर शैक्षणिक तैयारी को आत्मीयता, व्यक्तिगत ध्यान और जवाबदेही के साथ जोड़ते हैं।',
    'RBSE-affiliated. LKG to Class 12.': 'RBSE से संबद्ध। LKG से कक्षा 12 तक।',
    'Virat Nagar, Kotputli, Behror, Rajasthan.': 'विराट नगर, कोटपूतली, बहरोड़, राजस्थान।',
    'Made with care in Rajasthan': 'राजस्थान में स्नेह से बनाया गया',

    // About and campus
    'About us · Est. 2008': 'हमारे बारे में · स्थापना 2008',
    'A small school, in a small town, with': 'एक छोटे शहर का छोटा विद्यालय, पर',
    'very big care': 'बहुत बड़ी देखभाल',
    'For nearly twenty years, families from Virat Nagar, Kotputli and the wider Behror region have trusted us with their children.': 'लगभग बीस वर्षों से विराट नगर, कोटपूतली और बहरोड़ क्षेत्र के परिवारों ने अपने बच्चों के लिए हम पर विश्वास किया है।',
    'Our story': 'हमारी कहानी', 'Where it began': 'शुरुआत कहाँ से हुई',
    'Two rooms, twenty-four students, two teachers. The families of Virat Nagar needed a serious English-medium school close to home — and a small group of educators decided to build one.': 'दो कमरे, चौबीस विद्यार्थी और दो शिक्षक। विराट नगर के परिवारों को घर के पास एक गंभीर अंग्रेज़ी माध्यम विद्यालय चाहिए था—और कुछ शिक्षकों ने इसे बनाने का निर्णय लिया।',
    'Where we are': 'आज हम कहाँ हैं',
    'Today we teach more than twelve hundred students from LKG to Class 12, on a real campus with smart classrooms, science labs, a library, a playground, and our own fleet of buses.': 'आज हमारे परिसर में LKG से कक्षा 12 तक बारह सौ से अधिक विद्यार्थी पढ़ते हैं। यहाँ स्मार्ट कक्षाएँ, विज्ञान प्रयोगशालाएँ, पुस्तकालय, खेल मैदान और विद्यालय बसें हैं।',
    "What we're proud of": 'हमें किस बात पर गर्व है',
    "Strong board results, year after year. But the thing we're most proud of is harder to measure: that our students leave us a little more kind, a little more confident, and a little more curious than when they arrived.": 'हर वर्ष अच्छे बोर्ड परिणाम। लेकिन हमें सबसे अधिक गर्व इस बात पर है कि हमारे विद्यार्थी पहले से अधिक दयालु, आत्मविश्वासी और जिज्ञासु बनकर आगे बढ़ते हैं।',
    'What we believe': 'हमारा विश्वास', 'Small is good': 'छोटा समूह बेहतर है',
    'Eighteen students in a class. Teachers who know each child by name.': 'एक कक्षा में अठारह विद्यार्थी। शिक्षक हर बच्चे को नाम से जानते हैं।',
    'Foundations matter': 'मज़बूत नींव ज़रूरी है', 'Strong reading, clear writing, real arithmetic. Everything else is built on these.': 'अच्छा पढ़ना, स्पष्ट लिखना और सही गणित—बाकी सब इन्हीं पर बनता है।',
    'Discipline, not fear': 'अनुशासन, डर नहीं', 'Routines, expectations, follow-through. The point of discipline is freedom.': 'नियमितता, स्पष्ट अपेक्षाएँ और निरंतरता। अनुशासन का उद्देश्य आत्मनिर्भरता है।',
    'Parents are partners': 'अभिभावक हमारे साथी हैं', 'We keep parents close, communicate often, and trust them.': 'हम अभिभावकों को साथ रखते हैं, नियमित संवाद करते हैं और उन पर विश्वास करते हैं।',
    'From the principal': 'प्रधानाचार्य की ओर से', 'Principal': 'प्रधानाचार्य',
    '"Every child who walks in is someone\'s whole world. We hold that trust carefully."': '“विद्यालय आने वाला हर बच्चा किसी की पूरी दुनिया है। हम इस विश्वास को बहुत संभालकर रखते हैं।”',
    'View RBSE disclosures': 'RBSE प्रकटीकरण देखें',
    'Infrastructure': 'आधारभूत सुविधाएँ', 'Our campus.': 'हमारा परिसर।',
    'A working school, built slowly, kept well.': 'धीरे-धीरे बना और अच्छी तरह सँभाला गया सक्रिय विद्यालय।',
    'Smart classrooms': 'स्मार्ट कक्षाएँ', 'With projectors and good light, from LKG to Class 12.': 'LKG से कक्षा 12 तक प्रोजेक्टर और अच्छी रोशनी वाली कक्षाएँ।',
    'Science labs': 'विज्ञान प्रयोगशालाएँ', 'Separate physics, chemistry, and biology labs for senior classes.': 'वरिष्ठ कक्षाओं के लिए अलग भौतिकी, रसायन और जीव विज्ञान प्रयोगशालाएँ।',
    'Computers': 'कंप्यूटर', 'Full computer lab with internet and a working printer for students.': 'विद्यार्थियों के लिए इंटरनेट और प्रिंटर सहित पूर्ण कंप्यूटर लैब।',
    'Library books': 'पुस्तकालय की पुस्तकें', 'In Hindi, English, and Sanskrit. Open every school day.': 'हिंदी, अंग्रेज़ी और संस्कृत में। प्रत्येक विद्यालय दिवस खुला।',
    'Playground': 'खेल मैदान', 'A full-size field for cricket, football, and athletics.': 'क्रिकेट, फुटबॉल और एथलेटिक्स के लिए पूरा मैदान।',
    'Buses': 'बसें', 'Covering Virat Nagar, Kotputli, Behror, and nearby villages.': 'विराट नगर, कोटपूतली, बहरोड़ और आसपास के गाँवों तक सेवा।',

    // Admissions, fees and contact
    'A few seats remain.': 'कुछ सीटें शेष हैं।', 'Apply gently.': 'सरलता से आवेदन करें।',
    'Online applications for LKG through Class 11. Our office replies within a working day.': 'LKG से कक्षा 11 तक ऑनलाइन आवेदन। हमारा कार्यालय एक कार्य दिवस में उत्तर देता है।',
    'How it works': 'प्रक्रिया कैसे काम करती है', 'Four small steps. Nothing dramatic.': 'चार सरल चरण।',
    'Send an inquiry.': 'पूछताछ भेजें।', 'Fill the form below — it takes two minutes.': 'नीचे दिया फ़ॉर्म भरें—इसमें केवल दो मिनट लगते हैं।',
    'Visit us.': 'विद्यालय आएँ।', 'Come to the campus, see the classrooms, meet the teachers.': 'परिसर देखें, कक्षाओं का भ्रमण करें और शिक्षकों से मिलें।',
    'Submit documents.': 'दस्तावेज़ जमा करें।', 'Birth certificate, previous report card, Aadhaar, four photographs.': 'जन्म प्रमाण पत्र, पिछली रिपोर्ट कार्ड, आधार और चार फ़ोटो।',
    'Confirm admission.': 'प्रवेश की पुष्टि करें।', 'Pay the admission fee at the office and collect the books list.': 'कार्यालय में प्रवेश शुल्क जमा करें और पुस्तकों की सूची लें।',
    'Inquiry form': 'पूछताछ फ़ॉर्म', 'Tell us about your child.': 'अपने बच्चे के बारे में बताएँ।',
    "We'll get back to you within a working day.": 'हम एक कार्य दिवस में आपसे संपर्क करेंगे।',
    'Inquiry': 'पूछताछ', 'School call': 'विद्यालय का फ़ोन', 'Campus visit': 'परिसर भ्रमण',
    'Admission': 'प्रवेश', "Parent's name": 'अभिभावक का नाम', "Child's name": 'बच्चे का नाम',
    "Child's date of birth": 'बच्चे की जन्मतिथि', 'Applying for class': 'जिस कक्षा के लिए आवेदन है',
    'Select a class…': 'कक्षा चुनें…', 'Anything we should know?': 'कोई अन्य जानकारी जो हमें जाननी चाहिए?',
    'Send inquiry': 'पूछताछ भेजें',
    'Your inquiry is not an admission commitment. By submitting, you agree to our': 'यह पूछताछ प्रवेश की बाध्यता नहीं है। भेजकर आप हमारी',
    'privacy policy': 'गोपनीयता नीति', 'What to bring on visit day': 'विद्यालय भ्रमण के दिन क्या लाएँ',
    'Birth certificate of the child (original + photocopy)': 'बच्चे का जन्म प्रमाण पत्र (मूल + फोटोकॉपी)',
    "Previous year's report card (if applicable)": 'पिछले वर्ष की रिपोर्ट कार्ड (यदि लागू हो)',
    'Aadhaar card of parent and child': 'अभिभावक और बच्चे का आधार कार्ड',
    'Four recent passport-size photographs': 'चार नई पासपोर्ट आकार की फ़ोटो',
    'Transfer certificate (for Class 2 and above)': 'स्थानांतरण प्रमाण पत्र (कक्षा 2 और उससे ऊपर)',
    'For fee details, see our': 'शुल्क की जानकारी के लिए हमारी', 'fee structure': 'शुल्क संरचना देखें',
    'Fees': 'शुल्क', 'Fee structure.': 'शुल्क संरचना।', 'Transparent. Published. The same for everyone.': 'पारदर्शी, प्रकाशित और सभी के लिए समान।',
    'Tuition (₹/month)': 'शिक्षण शुल्क (₹/माह)', 'Annual (₹)': 'वार्षिक (₹)',
    'Transport, books, and uniform are charged separately. Sibling and need-based concessions are available — please ask the office.': 'परिवहन, पुस्तकें और वर्दी का शुल्क अलग है। भाई-बहन और आवश्यकता आधारित रियायत उपलब्ध है—कार्यालय से पूछें।',
    'Come and say hello.': 'आइए, हमसे मिलिए।', 'Office hours are 8 AM to 4 PM, Monday to Saturday.': 'कार्यालय समय सोमवार से शनिवार, सुबह 8 बजे से शाम 4 बजे तक है।',
    'Write to us': 'हमें लिखें', 'Send us a message.': 'हमें संदेश भेजें।', "We'll get back within a working day.": 'हम एक कार्य दिवस में उत्तर देंगे।',
    'Your name': 'आपका नाम', 'Subject': 'विषय', 'Message': 'संदेश', 'Send message': 'संदेश भेजें',
    'Thank you.': 'धन्यवाद।', "Your message has been received. We'll reply within one working day.": 'आपका संदेश मिल गया है। हम एक कार्य दिवस में उत्तर देंगे।',

    // Academics and information pages
    'The people who teach here.': 'हमारे शिक्षक।', 'Sixty-five teachers. Many of them have been with us for over a decade.': 'पैंसठ शिक्षक। इनमें से कई एक दशक से अधिक समय से हमारे साथ हैं।',
    'Moments from school life.': 'विद्यालय जीवन की झलकियाँ।', 'Classrooms, grounds, annual day, sports day, science fairs.': 'कक्षाएँ, मैदान, वार्षिकोत्सव, खेल दिवस और विज्ञान मेले।',
    'Holiday list 2026-27.': 'अवकाश सूची 2026–27।', 'The school is closed on these days.': 'इन दिनों विद्यालय बंद रहेगा।',
    "What's coming up.": 'आने वाले कार्यक्रम।', 'A few notes about the year ahead.': 'आने वाले वर्ष के कुछ प्रमुख कार्यक्रम।',
    'Independence Day assembly and student performances.': 'स्वतंत्रता दिवस सभा और विद्यार्थियों की प्रस्तुतियाँ।',
    "Children's Day — classrooms run by students for a day.": 'बाल दिवस—एक दिन कक्षाएँ विद्यार्थी चलाएँगे।',
    'Republic Day parade and flag-hoisting.': 'गणतंत्र दिवस परेड और ध्वजारोहण।',
    'Annual Day and inter-house science exhibition.': 'वार्षिकोत्सव और अंतर-सदनीय विज्ञान प्रदर्शनी।',
    'Annual sports meet and prize distribution.': 'वार्षिक खेलकूद और पुरस्कार वितरण।',
    "What's happening at school.": 'विद्यालय में क्या हो रहा है।', 'Holiday lists, exam dates, PTM schedules, and other announcements.': 'अवकाश सूची, परीक्षा तिथियाँ, PTM समय और अन्य घोषणाएँ।',
    'Notice': 'सूचना', '← All notices': '← सभी सूचनाएँ', '← All albums': '← सभी एल्बम',
    'Archive': 'अभिलेख', 'Older notices.': 'पुरानी सूचनाएँ।', 'Notices from earlier in the year.': 'वर्ष की पिछली सूचनाएँ।',
    'Looking for a specific circular or announcement?': 'किसी विशेष परिपत्र या घोषणा की तलाश है?',
    'See the current notices': 'वर्तमान सूचनाएँ देखें', ', or contact the office.': ', या कार्यालय से संपर्क करें।',
    'Mandatory disclosures.': 'अनिवार्य प्रकटीकरण।', 'Information published as required by RBSE norms.': 'RBSE नियमों के अनुसार प्रकाशित जानकारी।',
    'School name': 'विद्यालय का नाम', 'Affiliation No.': 'संबद्धता संख्या', 'School Code': 'विद्यालय कोड',
    'Board': 'बोर्ड', 'Rajasthan Board of Secondary Education (RBSE)': 'राजस्थान माध्यमिक शिक्षा बोर्ड (RBSE)',
    'Address': 'पता', 'Established': 'स्थापना वर्ष', 'Total students': 'कुल विद्यार्थी', 'Total teachers': 'कुल शिक्षक',
    'Check your result.': 'अपना परिणाम देखें।', 'Enter your roll number and date of birth to see your marks.': 'अंक देखने के लिए रोल नंबर और जन्मतिथि दर्ज करें।',
    'Roll number': 'रोल नंबर', 'Date of birth': 'जन्मतिथि', 'View result': 'परिणाम देखें',
    'Your roll number and date of birth must match the school record.': 'रोल नंबर और जन्मतिथि विद्यालय रिकॉर्ड से मेल खाने चाहिए।',
    'Accessibility.': 'सुगम्यता।', 'We want this site to be usable for everyone.': 'हम चाहते हैं कि यह वेबसाइट सभी के लिए उपयोगी हो।',
    'This site follows WCAG 2.1 AA guidelines. It works on screen readers, can be navigated by keyboard, and resizes gracefully for small screens.': 'यह वेबसाइट WCAG 2.1 AA दिशानिर्देशों का पालन करती है। यह स्क्रीन रीडर, कीबोर्ड नेविगेशन और छोटे स्क्रीन आकारों पर अच्छी तरह काम करती है।',
    'If something is hard to use, please tell us at': 'यदि किसी सुविधा का उपयोग कठिन लगे, तो हमें बताएँ:', 'and we\'ll fix it.': 'और हम उसे ठीक करेंगे।',
    'Privacy policy.': 'गोपनीयता नीति।', 'How we handle the information you share with us.': 'आपकी साझा की गई जानकारी का हम कैसे उपयोग करते हैं।',
    'What we collect': 'हम क्या जानकारी लेते हैं', "What we don't do": 'हम क्या नहीं करते', 'Your rights': 'आपके अधिकार',
    'Terms of use.': 'उपयोग की शर्तें।', 'A few ground rules for using this website.': 'इस वेबसाइट के उपयोग के कुछ सामान्य नियम।',
    'Accuracy': 'शुद्धता', 'External links': 'बाहरी लिंक', 'Sitemap.': 'साइटमैप।', 'A simple list of every page on this site.': 'इस वेबसाइट के सभी पृष्ठों की सरल सूची।',
    'This page doesn\'t exist.': 'यह पृष्ठ उपलब्ध नहीं है।', 'But here are some places you might want to go:': 'आप इन पृष्ठों पर जा सकते हैं:',
    "We've received your note.": 'आपका संदेश हमें मिल गया है।', 'Our office will be in touch within a working day.': 'हमारा कार्यालय एक कार्य दिवस में आपसे संपर्क करेगा।',

    // Form fields and classes
    'Class': 'कक्षा', 'Section': 'सेक्शन', 'Admission number': 'प्रवेश संख्या',
    'Student name': 'विद्यार्थी का नाम', 'Student full name': 'विद्यार्थी का पूरा नाम',
    "Child's full name": 'बच्चे का पूरा नाम', 'Password': 'पासवर्ड', 'Confirm password': 'पासवर्ड की पुष्टि करें',
    'Username': 'उपयोगकर्ता नाम', 'Mobile number': 'मोबाइल नंबर', 'Mobile number (as given to school)': 'मोबाइल नंबर (जो विद्यालय को दिया है)',
    'Your full name': 'आपका पूरा नाम', 'Your details': 'आपकी जानकारी', 'Your child': 'आपका बच्चा',
    '(optional)': '(वैकल्पिक)', '(optional now—you can add children later)': '(अभी वैकल्पिक—बाद में बच्चे जोड़ सकते हैं)',
    'Select class…': 'कक्षा चुनें…', 'Unknown / none': 'पता नहीं / लागू नहीं',
    'Class 1': 'कक्षा 1', 'Class 2': 'कक्षा 2', 'Class 3': 'कक्षा 3', 'Class 4': 'कक्षा 4',
    'Class 5': 'कक्षा 5', 'Class 6': 'कक्षा 6', 'Class 7': 'कक्षा 7', 'Class 8': 'कक्षा 8',
    'Class 9': 'कक्षा 9', 'Class 10': 'कक्षा 10', 'Class 11': 'कक्षा 11',
    'Class 11 (Science)': 'कक्षा 11 (विज्ञान)', 'Class 11 (Arts)': 'कक्षा 11 (कला)', 'Class 11 (Agriculture)': 'कक्षा 11 (कृषि)',
    'Class 12 (Science)': 'कक्षा 12 (विज्ञान)', 'Class 12 (Arts)': 'कक्षा 12 (कला)', 'Class 12 (Agriculture)': 'कक्षा 12 (कृषि)',
    'LKG – UKG': 'LKG – UKG', 'Class 1 – 5': 'कक्षा 1 – 5', 'Class 6 – 8': 'कक्षा 6 – 8', 'Class 9 – 10': 'कक्षा 9 – 10', 'Class 11 – 12': 'कक्षा 11 – 12',

    // Parent portal
    'Parent sign in': 'अभिभावक साइन इन', 'Enter the mobile number and password you used during registration.': 'पंजीकरण के समय दिया मोबाइल नंबर और पासवर्ड दर्ज करें।',
    'New here?': 'पहली बार आए हैं?', 'Request an account': 'खाता अनुरोध करें', 'Already have an account?': 'क्या आपका खाता पहले से है?',
    'Request account': 'खाता अनुरोध', 'Fill in your details. The school office will review and approve.': 'अपनी जानकारी भरें। विद्यालय कार्यालय समीक्षा करके स्वीकृति देगा।',
    'Your account will not be active immediately. Once approved, you can sign in with the mobile number and password you provide here.': 'आपका खाता तुरंत सक्रिय नहीं होगा। स्वीकृति के बाद आप यहाँ दिए मोबाइल नंबर और पासवर्ड से साइन इन कर सकेंगे।',
    'Details are checked against the student master list by the school office before any results become visible.': 'परिणाम दिखने से पहले विद्यालय कार्यालय विद्यार्थी सूची से जानकारी की पुष्टि करता है।',
    'Submit request': 'अनुरोध भेजें', 'Awaiting verification': 'सत्यापन की प्रतीक्षा',
    'Your account is pending review': 'आपके खाते की समीक्षा जारी है',
    'The school office has received your request. Staff will verify your account and child details before portal access is approved.': 'विद्यालय कार्यालय को आपका अनुरोध मिल गया है। पोर्टल पहुँच देने से पहले खाते और बच्चे की जानकारी सत्यापित की जाएगी।',
    'You do not need to register again. Use the same mobile number and password after approval.': 'दोबारा पंजीकरण न करें। स्वीकृति के बाद उसी मोबाइल नंबर और पासवर्ड का उपयोग करें।',
    'Check again': 'फिर जाँचें', 'Welcome': 'स्वागत है', 'Your children': 'आपके बच्चे',
    'Child-link requests': 'बच्चे को जोड़ने के अनुरोध', 'Request a link for another child': 'दूसरे बच्चे को जोड़ने का अनुरोध करें',
    'The school office verifies each request against the student master list before results are shown.': 'परिणाम दिखाने से पहले विद्यालय कार्यालय हर अनुरोध को विद्यार्थी सूची से सत्यापित करता है।',
    'Submit link request': 'जोड़ने का अनुरोध भेजें', 'Upcoming exams': 'आगामी परीक्षाएँ',
    'Next 90 days': 'अगले 90 दिन', 'Results published': 'प्रकाशित परिणाम', 'For your child': 'आपके बच्चे के लिए',
    'Upcoming & recent exams': 'आगामी और हाल की परीक्षाएँ', 'Published results': 'प्रकाशित परिणाम', 'School site': 'विद्यालय वेबसाइट',
    'Verified': 'सत्यापित', 'Awaiting review': 'समीक्षा की प्रतीक्षा', 'Needs attention': 'ध्यान आवश्यक',
    'Cancel request': 'अनुरोध रद्द करें', 'No pending child-link requests.': 'बच्चे को जोड़ने का कोई अनुरोध लंबित नहीं है।',

    // Admin shell and pages
    'Dashboard': 'डैशबोर्ड', 'Overview': 'अवलोकन', 'Manage': 'प्रबंधन', 'Academics': 'शैक्षणिक', 'System': 'सिस्टम',
    'Audit log': 'गतिविधि रिकॉर्ड', 'Exams': 'परीक्षाएँ', 'Students': 'विद्यार्थी', 'Messages': 'संदेश', 'Inquiries': 'पूछताछ',
    'VPS Admin': 'VPS एडमिन', 'Admin panel': 'एडमिन पैनल', 'Welcome back': 'फिर से स्वागत है',
    "Here's what needs your attention today.": 'आज इन विषयों पर ध्यान देना है।',
    'Add student': 'विद्यार्थी जोड़ें', 'Master list': 'मुख्य सूची', 'Schedule exam': 'परीक्षा तय करें',
    'Post notice': 'सूचना प्रकाशित करें', 'School updates': 'विद्यालय अपडेट', 'Review parents': 'अभिभावक समीक्षा',
    'Pending requests': 'लंबित अनुरोध', 'New inquiries': 'नई पूछताछ', 'Parent requests': 'अभिभावक अनुरोध',
    'Unread messages': 'अपठित संदेश', 'Scheduled exams': 'निर्धारित परीक्षाएँ', 'Active students': 'सक्रिय विद्यार्थी',
    'Open master list →': 'मुख्य सूची खोलें →', 'Recent inquiries': 'हाल की पूछताछ', 'Recent activity': 'हाल की गतिविधि',
    'Every admin action is recorded here for accountability.': 'जवाबदेही के लिए हर एडमिन गतिविधि यहाँ दर्ज होती है।',
    'Exams & results': 'परीक्षाएँ और परिणाम', 'Schedule exams and upload student results. Parents see them in their portal.': 'परीक्षाएँ तय करें और विद्यार्थियों के परिणाम अपलोड करें। अभिभावक इन्हें पोर्टल में देखेंगे।',
    '+ New exam': '+ नई परीक्षा', 'Schedule a new exam': 'नई परीक्षा तय करें', 'Pick a class, subject, date, and time. No typing required.': 'कक्षा, विषय, तिथि और समय चुनें।',
    'Title (auto-filled if blank)': 'शीर्षक (खाली रहने पर स्वतः भरेगा)', 'Title': 'शीर्षक', 'Date': 'तिथि',
    'Max marks': 'अधिकतम अंक', 'Start time': 'आरंभ समय', 'End time': 'समाप्ति समय',
    'Syllabus / notes (optional)': 'पाठ्यक्रम / टिप्पणी (वैकल्पिक)', 'Save exam': 'परीक्षा सहेजें',
    'Upload results': 'परिणाम अपलोड करें', 'Students from the master list are loaded automatically. Add marks for each student.': 'मुख्य सूची से विद्यार्थी स्वतः लोड होते हैं। प्रत्येक विद्यार्थी के अंक जोड़ें।',
    'Quick paste:': 'त्वरित पेस्ट:', 'Tab-separated rows. Columns:': 'टैब से अलग पंक्तियाँ। कॉलम:',
    'Name | Roll | Marks | Grade': 'नाम | रोल | अंक | ग्रेड', 'Parse and add rows': 'पंक्तियाँ पढ़कर जोड़ें',
    '+ Add another student': '+ एक और विद्यार्थी जोड़ें', 'Save draft': 'ड्राफ्ट सहेजें', 'Publish results': 'परिणाम प्रकाशित करें',
    'Gallery albums': 'गैलरी एल्बम', 'All photo albums shown on the public site.': 'सार्वजनिक वेबसाइट पर दिखने वाले सभी फ़ोटो एल्बम।',
    'Admission inquiries': 'प्रवेश पूछताछ', 'All submitted admission inquiries. Click a card to see full details.': 'सभी प्राप्त प्रवेश पूछताछ। पूरी जानकारी के लिए कार्ड खोलें।',
    'All statuses': 'सभी स्थितियाँ', 'New only': 'केवल नई', 'Contacted': 'संपर्क किया', 'Admitted': 'प्रवेश दिया',
    'Rejected': 'अस्वीकृत', 'Inquiry details': 'पूछताछ विवरण',
    'Manage school content, parents, exams, and results.': 'विद्यालय सामग्री, अभिभावक, परीक्षाएँ और परिणाम प्रबंधित करें।',
    'Contact messages': 'संपर्क संदेश', 'Submissions from the public contact form.': 'सार्वजनिक संपर्क फ़ॉर्म से आए संदेश।',
    'Publish announcements, exam schedules, and holiday lists.': 'घोषणाएँ, परीक्षा कार्यक्रम और अवकाश सूची प्रकाशित करें।',
    '+ New notice': '+ नई सूचना', 'New notice': 'नई सूचना', 'Will be visible on the public site immediately when published.': 'प्रकाशित करते ही सार्वजनिक वेबसाइट पर दिखाई देगी।',
    'Category': 'श्रेणी', 'Publish date': 'प्रकाशन तिथि', 'Body (HTML allowed)': 'विवरण (HTML स्वीकार्य)',
    'Published (visible on site)': 'प्रकाशित (वेबसाइट पर दिखाई देगा)', 'Save notice': 'सूचना सहेजें',
    'General': 'सामान्य', 'Exam': 'परीक्षा', 'Holiday': 'अवकाश',
    'Parent accounts': 'अभिभावक खाते', 'Approve, reject, or reset parent registration requests. Approved parents can sign in to view their child\'s exam schedule and results.': 'अभिभावक पंजीकरण अनुरोध स्वीकृत, अस्वीकृत या रीसेट करें। स्वीकृत अभिभावक बच्चे की परीक्षा और परिणाम देख सकते हैं।',
    'Pending': 'लंबित', 'Approved': 'स्वीकृत', 'Results lookup': 'परिणाम खोज',
    "Search a student's published result by roll number and date of birth.": 'रोल नंबर और जन्मतिथि से विद्यार्थी का प्रकाशित परिणाम खोजें।',
    'Look up': 'खोजें', 'Student master list': 'विद्यार्थी मुख्य सूची', 'Add each student once. Results can reuse this list later.': 'हर विद्यार्थी को एक बार जोड़ें। परिणामों में इसी सूची का दोबारा उपयोग होगा।',
    'Cancel edit': 'संपादन रद्द करें', 'Refresh list': 'सूची रीफ़्रेश करें',
    'Approve account': 'खाता स्वीकृत करें', 'Reject account': 'खाता अस्वीकृत करें', 'Reset to pending': 'फिर लंबित करें',
    'Delete account': 'खाता हटाएँ', 'Verify & link': 'सत्यापित कर जोड़ें', 'Reject match': 'मिलान अस्वीकार करें',
    'Unlink child': 'बच्चे का लिंक हटाएँ', 'Link selected': 'चुने विद्यार्थी को जोड़ें', 'Verified link': 'सत्यापित लिंक',

    // Current seeded dynamic content
    'Admissions Open for Academic Year 2026-27': 'शैक्षणिक वर्ष 2026–27 के लिए प्रवेश खुले हैं',
    'Welcome to VPS': 'VPS में आपका स्वागत है', 'ADMISSION': 'प्रवेश', 'GENERAL': 'सामान्य', 'HOLIDAY': 'अवकाश', 'EXAM': 'परीक्षा'
  };

  Object.assign(HI, {
    'All': 'सभी', 'Thank you': 'धन्यवाद', 'Admissions 2026-27': 'प्रवेश 2026–27',
    'Fee structure': 'शुल्क संरचना', 'Form input': 'फ़ॉर्म इनपुट', 'Buttons': 'बटन',
    'Buttons, cards, forms.': 'बटन, कार्ड और फ़ॉर्म।', 'Components': 'घटक',
    'Design system': 'डिज़ाइन प्रणाली', 'Design system.': 'डिज़ाइन प्रणाली।',
    'Soft. Warm. Friendly.': 'सरल। आत्मीय। सुविधाजनक।',
    'Plum + Rose + Sky. Aimed at being calm and kind, not busy.': 'प्लम, रोज़ और स्काई रंग—शांत, सरल और आत्मीय अनुभव के लिए।',
    'Palette': 'रंग-संग्रह', 'The colours we use.': 'हमारे उपयोग किए गए रंग।',
    'Typography': 'अक्षर शैली', 'Fraunces & Inter.': 'Fraunces और Inter।',
    'A school for children.': 'बच्चों के लिए विद्यालय।', 'A school for parents, too.': 'अभिभावकों के लिए भी विद्यालय।',
    'Smaller headings for cards.': 'कार्ड के लिए छोटे शीर्षक।',
    'Body text is set in Inter at 16px. Generous line-height. Calm.': 'मुख्य पाठ 16px में, पढ़ने योग्य अंतर और शांत रूप के साथ।',
    'See it live': 'लाइव देखें', 'Cream': 'क्रीम',
    'Names, contact details, dates of birth, previous school records, and any messages you send us.': 'नाम, संपर्क जानकारी, जन्मतिथि, पिछले विद्यालय के रिकॉर्ड और आपके भेजे संदेश।',
    'We collect only the information you give us — through admission forms, inquiry forms, and contact messages. We use it to respond to you, run the school, and keep you informed about your child\'s education.': 'हम केवल वही जानकारी लेते हैं जो आप प्रवेश, पूछताछ या संपर्क फ़ॉर्म में देते हैं। इसका उपयोग उत्तर देने, विद्यालय चलाने और बच्चे की शिक्षा से जुड़ी जानकारी देने के लिए होता है।',
    'We don\'t sell your data. We don\'t share it with third parties for marketing.': 'हम आपका डेटा नहीं बेचते और विपणन के लिए किसी तीसरे पक्ष से साझा नहीं करते।',
    'You can ask to see, correct, or delete the information we hold about your family. Write to us at': 'आप अपने परिवार से जुड़ी जानकारी देखने, सुधारने या हटाने का अनुरोध कर सकते हैं। हमें लिखें:',
    'By using this website, you agree to use it for personal, non-commercial purposes. Information published here is meant to help families learn about our school.': 'इस वेबसाइट का उपयोग व्यक्तिगत और गैर-व्यावसायिक उद्देश्य से करें। यहाँ प्रकाशित जानकारी परिवारों को विद्यालय के बारे में बताने के लिए है।',
    'We do our best to keep notices, results, and other published information accurate. If you spot something wrong, please tell us.': 'हम सूचनाएँ, परिणाम और अन्य जानकारी सही रखने का पूरा प्रयास करते हैं। कोई गलती दिखे तो हमें बताएँ।',
    'Where we link to other sites, we don\'t control their content.': 'अन्य वेबसाइटों की सामग्री पर हमारा नियंत्रण नहीं है।',
    'Virat Nagar, Kotputli': 'विराट नगर, कोटपूतली', 'Behror, Rajasthan — 303102': 'बहरोड़, राजस्थान — 303102',
    'Virat Nagar, Kotputli, Behror, Rajasthan — 303102': 'विराट नगर, कोटपूतली, बहरोड़, राजस्थान — 303102',
    'February 2027': 'फ़रवरी 2027', 'March 2027': 'मार्च 2027',
    '15 August 2026': '15 अगस्त 2026', '14 November 2026': '14 नवंबर 2026', '26 January 2027': '26 जनवरी 2027',
    'Allowed: p, br, strong, em, ul, ol, li, a, h3, h4': 'स्वीकृत HTML: p, br, strong, em, ul, ol, li, a, h3, h4',
    'Past': 'समाप्त', 'Upcoming': 'आगामी', 'Published': 'प्रकाशित', 'Draft': 'ड्राफ्ट', 'New': 'नया', 'Read': 'पढ़ा गया',
    'No notices yet.': 'अभी कोई सूचना नहीं है।', 'No albums yet.': 'अभी कोई एल्बम नहीं है।',
    'No published results yet.': 'अभी कोई प्रकाशित परिणाम नहीं है।', 'No upcoming exams scheduled.': 'अभी कोई आगामी परीक्षा निर्धारित नहीं है।',
    'Could not load.': 'लोड नहीं हो सका।', 'Network error.': 'नेटवर्क त्रुटि।', 'Please try again.': 'कृपया फिर प्रयास करें।',
    'Open': 'खोलें', 'Mark contacted': 'संपर्क किया चिह्नित करें', 'Admit': 'प्रवेश दें', 'Reject': 'अस्वीकार करें',
    'Publish': 'प्रकाशित करें', 'Unpublish': 'प्रकाशन हटाएँ', 'Refresh': 'रीफ़्रेश करें',
    '© 2026 Virat Public School': '© 2026 विराट पब्लिक स्कूल',
    'Virat Public School | Kotputli, Behror': 'विराट पब्लिक स्कूल | कोटपूतली, बहरोड़',
    'Page not found | Virat Public School': 'पृष्ठ नहीं मिला | विराट पब्लिक स्कूल',
    'About Us | Virat Public School': 'हमारे बारे में | विराट पब्लिक स्कूल',
    'Admissions 2026-27 | Virat Public School': 'प्रवेश 2026–27 | विराट पब्लिक स्कूल',
    'Contact | Virat Public School': 'संपर्क | विराट पब्लिक स्कूल',
    'Results | Virat Public School': 'परिणाम | विराट पब्लिक स्कूल',
    'Notices | Virat Public School': 'सूचनाएँ | विराट पब्लिक स्कूल',
    'Gallery | Virat Public School': 'गैलरी | विराट पब्लिक स्कूल',
    'Faculty | Virat Public School': 'शिक्षकगण | विराट पब्लिक स्कूल',
    'Holiday List | Virat Public School': 'अवकाश सूची | विराट पब्लिक स्कूल',
    'SCHOOL HOLIDAY FOR 12 JULY': '12 जुलाई को विद्यालय अवकाश',
    'School holiday due to rain': 'बारिश के कारण विद्यालय में अवकाश',
    'MATH MAJOR EXAM': 'गणित मुख्य परीक्षा',
    'Exam on 18 July 2026, 11:00 – 13:07 — Class 12 (Science)': 'परीक्षा 18 जुलाई 2026, 11:00 – 13:07 — कक्षा 12 (विज्ञान)',
    'MATH MAJOR EXAM is scheduled for 18 July 2026 at 11:00 – 13:07 for Class 12 (Science).chapters 1.1 se 1.5Please be in your seats 10 minutes before the start time. Bring your school ID and stationery.': 'गणित मुख्य परीक्षा 18 जुलाई 2026 को 11:00 – 13:07 बजे कक्षा 12 (विज्ञान) के लिए निर्धारित है। अध्याय 1.1 से 1.5। कृपया आरंभ समय से 10 मिनट पहले अपनी सीट पर बैठें। विद्यालय पहचान-पत्र और लेखन सामग्री साथ लाएँ।',
    'Online applications are now being accepted for LKG through Class 11 (Science, Commerce, and Arts streams) for the 2026-27 academic year.How to applyFill the inquiry form on our websiteVisit the campus for a tour and meetingSubmit required documents at the officeComplete admission by paying the feeLimited seats available in select classes. Apply early to secure your spot.': 'शैक्षणिक वर्ष 2026–27 के लिए LKG से कक्षा 11 (विज्ञान, वाणिज्य और कला) तक ऑनलाइन आवेदन स्वीकार किए जा रहे हैं। आवेदन कैसे करें: वेबसाइट पर पूछताछ फ़ॉर्म भरें, परिसर भ्रमण और बैठक के लिए आएँ, कार्यालय में आवश्यक दस्तावेज़ जमा करें और शुल्क देकर प्रवेश पूरा करें। कुछ कक्षाओं में सीमित सीटें हैं, इसलिए समय पर आवेदन करें।',
    'Online applications are now being accepted for LKG through Class 11 (Science, Commerce, and Arts streams) for the 2026-27 academic year.How to applyFill the inquiry form on our websiteVisit the campus': 'शैक्षणिक वर्ष 2026–27 के लिए LKG से कक्षा 11 तक ऑनलाइन आवेदन स्वीकार किए जा रहे हैं। आवेदन के लिए पूछताछ फ़ॉर्म भरें और परिसर आएँ।'
  });

  const PATTERNS = [
    [/^Hello, (.+)\.$/, 'नमस्ते, $1।'],
    [/^Signed in as (.+)\.$/, '$1 के रूप में साइन इन हैं।'],
    [/^Signed in as (.+)\. Child data shown here is verified by the school office\.$/, '$1 के रूप में साइन इन हैं। यहाँ दिखाया गया बच्चे का डेटा विद्यालय द्वारा सत्यापित है।'],
    [/^Class (\d+)$/, 'कक्षा $1'],
    [/^Roll (.+)$/, 'रोल $1'],
    [/^Section (.+)$/, 'सेक्शन $1'],
    [/^(\d+) marks$/, '$1 अंक'],
    [/^Loading (.+)…$/, '$1 लोड हो रहा है…']
  ];

  const MONTHS_HI = {
    January:'जनवरी', February:'फ़रवरी', March:'मार्च', April:'अप्रैल', May:'मई', June:'जून',
    July:'जुलाई', August:'अगस्त', September:'सितंबर', October:'अक्टूबर', November:'नवंबर', December:'दिसंबर',
    Jan:'जन॰', Feb:'फ़र॰', Mar:'मार्च', Apr:'अप्रैल', Jun:'जून', Jul:'जुल॰', Aug:'अग॰', Sep:'सित॰', Oct:'अक्टू॰', Nov:'नव॰', Dec:'दिस॰'
  };

  const textState = new WeakMap();
  const attrState = new WeakMap();
  let language = 'en';
  let applying = false;

  function normalized(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function translated(value) {
    const clean = normalized(value);
    if (!clean) return value;
    if (HI[clean]) return HI[clean];
    for (const [pattern, replacement] of PATTERNS) if (pattern.test(clean)) return clean.replace(pattern, replacement);
    let result = clean;
    for (const [month, hindi] of Object.entries(MONTHS_HI)) result = result.replace(new RegExp(`\\b${month}\\b`, 'g'), hindi);
    result = result.replace(/\bAM\b/g, 'पूर्वाह्न').replace(/\bPM\b/g, 'अपराह्न');
    return result;
  }
  function ignored(node) {
    const parent = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !parent || !!parent.closest('script, style, svg, code, pre, [data-no-i18n], [contenteditable="true"]');
  }
  function renderText(node) {
    if (ignored(node) || !normalized(node.data)) return;
    let state = textState.get(node);
    if (!state || node.data !== state.rendered) state = { original: node.data, rendered: node.data };
    const lead = (state.original.match(/^\s*/) || [''])[0];
    const tail = (state.original.match(/\s*$/) || [''])[0];
    const core = normalized(state.original);
    const next = language === 'hi' ? lead + translated(core) + tail : state.original;
    state.rendered = next;
    textState.set(node, state);
    if (node.data !== next) node.data = next;
  }
  function renderAttributes(element) {
    if (ignored(element)) return;
    const attrs = ['placeholder', 'title', 'aria-label'];
    let states = attrState.get(element) || {};
    for (const attr of attrs) {
      if (!element.hasAttribute(attr)) continue;
      const current = element.getAttribute(attr);
      let state = states[attr];
      if (!state || current !== state.rendered) state = { original: current, rendered: current };
      const next = language === 'hi' ? translated(state.original) : state.original;
      state.rendered = next;
      states[attr] = state;
      if (current !== next) element.setAttribute(attr, next);
    }
    attrState.set(element, states);
  }
  function render(root) {
    applying = true;
    if (root.nodeType === Node.TEXT_NODE) renderText(root);
    else if (root.nodeType === Node.ELEMENT_NODE || root.nodeType === Node.DOCUMENT_NODE) {
      if (root.nodeType === Node.ELEMENT_NODE) renderAttributes(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) node.nodeType === Node.TEXT_NODE ? renderText(node) : renderAttributes(node);
    }
    if (document.title) {
      const originalTitle = document.documentElement.dataset.originalTitle || document.title;
      document.documentElement.dataset.originalTitle = originalTitle;
      document.title = language === 'hi' ? translated(originalTitle) : originalTitle;
    }
    applying = false;
  }

  function ensureToggle() {
    let button = document.getElementById('vps-language-toggle');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.id = 'vps-language-toggle';
      button.className = 'language-toggle';
      button.dataset.noI18n = 'true';
      button.addEventListener('click', () => setLanguage(language === 'en' ? 'hi' : 'en'));
    }
    const publicBar = document.querySelector('.app-topbar');
    const adminActions = document.querySelector('.topbar .right');
    const loginCard = document.querySelector('.login-card');
    const target = adminActions || publicBar || loginCard || document.body;
    if (button.parentElement !== target) target.appendChild(button);
    if (button.dataset.language !== language) {
      button.innerHTML = language === 'hi' ? '<span aria-hidden="true">EN</span><strong>English</strong>' : '<span aria-hidden="true">अ</span><strong>हिंदी</strong>';
      button.dataset.language = language;
    }
    button.setAttribute('aria-label', language === 'hi' ? 'Switch website to English' : 'वेबसाइट को हिंदी में बदलें');
    button.setAttribute('title', language === 'hi' ? 'English' : 'हिंदी');
    button.classList.toggle('language-toggle-fixed', target === document.body || target === loginCard);
  }

  function setLanguage(next) {
    language = next === 'hi' ? 'hi' : 'en';
    try { localStorage.setItem('vps-language', language); } catch (_) {}
    document.documentElement.lang = language;
    document.documentElement.classList.toggle('lang-hi', language === 'hi');
    ensureToggle();
    render(document.body);
    document.dispatchEvent(new CustomEvent('vpslanguagechange', { detail: { language } }));
  }

  function init() {
    const requested = new URLSearchParams(location.search).get('lang');
    let stored = 'en';
    try { stored = localStorage.getItem('vps-language') || 'en'; } catch (_) {}
    language = requested === 'hi' || requested === 'en' ? requested : stored;
    ensureToggle();
    setLanguage(language);

    const observer = new MutationObserver((mutations) => {
      if (applying) return;
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') render(mutation.target);
        else mutation.addedNodes.forEach(node => render(node));
      }
      ensureToggle();
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  }

  window.VPS_I18N = { setLanguage, getLanguage: () => language, strings: HI };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
