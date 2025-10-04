// Minimal static translations for enumerated values used in UI
import { Language } from '@/contexts/LanguageContext';

const MAP: Record<string, string> = {
  // Transaction types
  'buy': 'खरेदी',
  'sale': 'विक्री',
  'for sale': 'विक्री',
  'rent': 'भाडे',
  'for rent': 'भाड्याने',
  'lease': 'लीज',
  'for lease': 'लीज',

  // Categories
  'residential': 'निवासी',
  'commercial': 'व्यावसायिक',
  'agricultural': 'कृषी',
  'industrial': 'औद्योगिक',

  // Furnishing
  'furnished': 'सुसज्ज',
  'semi-furnished': 'अर्ध-सुसज्ज',
  'semi furnished': 'अर्ध-सुसज्ज',
  'fully-furnished': 'पूर्ण सुसज्ज',
  'fully furnished': 'पूर्ण सुसज्ज',
  'unfurnished': 'असुसज्ज',

  // Property types
  'apartment': 'अपार्टमेंट',
  'flat': 'फ्लॅट',
  'flat/apartment': 'फ्लॅट/अपार्टमेंट',
  'house': 'घर',
  'bungalow': 'बंगला',
  'villa': 'व्हिला',
  'row house': 'रो हाऊस',
  'row-house': 'रो हाऊस',
  'rowhouse': 'रो हाऊस',
  'office': 'कार्यालय',
  'office space': 'कार्यालय जागा',
  'shop': 'दुकान',
  'showroom': 'शोरूम',
  'warehouse': 'गोदाम',
  'building': 'इमारत',
  'land': 'जमीन',
  'plot': 'प्लॉट',
  'plot/land': 'प्लॉट/जमीन',

  // Directions
  'north': 'उत्तर',
  'south': 'दक्षिण',
  'east': 'पूर्व',
  'west': 'पश्चिम',
  'north-east': 'ईशान्य',
  'north east': 'ईशान्य',
  'northeast': 'ईशान्य',
  'north-west': 'वायव्य',
  'north west': 'वायव्य',
  'northwest': 'वायव्य',
  'south-east': 'आग्नेय',
  'south east': 'आग्नेय',
  'southeast': 'आग्नेय',
  'south-west': 'नैऋत्य',
  'south west': 'नैऋत्य',
  'southwest': 'नैऋत्य',

  // Status
  'ready to move': 'ताबडतोब राहण्यास तयार',
  'under construction': 'बांधकाम सुरू',

  // Parking
  'covered parking': 'आच्छादित पार्किंग',
  'open parking': 'मोकळे पार्किंग',

  // Common units/labels
  'bhk': 'बीएचके',
  'sq ft': 'चौ. फु.',
  'sqft': 'चौरस फूट',
  'per sq ft': 'प्रति चौ. फु.',
  'l': 'लाख',
  'cr': 'कोटी',

  // Booleans / availability
  'yes': 'होय',
  'no': 'नाही',
  'not available': 'उपलब्ध नाही',

  // Misc property details
  'cabins': 'कॅबिन',
  'floor': 'मजला',
  'reception area': 'रिसेप्शन क्षेत्र',
  'broadband ready': 'ब्रॉडबॅंड उपलब्ध',
  'sewerage connection': 'सांडपाणी जोडणी',
  'title deed clear': 'हक्क पत्र स्पष्ट',
  'cctv surveillance': 'सीसीटीव्ही निगराणी',
  'earthquake resistant': 'भूकंप प्रतिरोधक',
  'power backup': 'वीज बॅकअप',
  'parking': 'पार्किंग',
  'security': 'सुरक्षा',
  'elevator': 'लिफ्ट',
  'midc': 'एमआयडीसी',
  
  // Common UI terms
  'loading': 'लोड होत आहे',
  'loading...': 'लोड होत आहे...',
  'search': 'शोध',
  'filter': 'फिल्टर',
  'no properties found': 'कोणती प्रॉपर्टी सापडली नाही',
  'properties found': 'प्रॉपर्टीज सापडल्या',
  'view details': 'तपशील पहा',
  'whatsapp': 'व्हॉट्सअ‍ॅप',
  'call now': 'आता कॉल करा',
  'contact details': 'संपर्क तपशील',
  'amenities': 'सुविधा',
  'more': 'अधिक',
  'share': 'शेअर करा',
  'saved': 'जतन केले',
  'save': 'जतन करा',
  'featured': 'फीचर्ड',
  'clear all': 'सर्व साफ करा',
  'apply filters': 'फिल्टर लागू करा',
  'sort by': 'यानुसार विलग करा',

  // Aurangabad localities (49)
  'cidco': 'सिडको (CIDCO)',
  'cidco n-1': 'सिडको N-1 (CIDCO N-1)',
  'cidco n1': 'सिडको N-1 (CIDCO N-1)',
  'cidco n-2': 'सिडको N-2 (CIDCO N-2)',
  'cidco n2': 'सिडको N-2 (CIDCO N-2)',
  'cidco n-3': 'सिडको N-3 (CIDCO N-3)',
  'cidco n3': 'सिडको N-3 (CIDCO N-3)',
  'osmanpura': 'उस्मानपुरा',
  'garkheda': 'गारखेड़ा',
  'beed bypass': 'बीड बायपास',
  'beed-bypass': 'बीड बायपास',
  'waluj': 'वालुज',
  'paithan road': 'पैठण रोड',
  'paithan-road': 'पैठण रोड',
  'kanchanwadi': 'कंचनवाडी',
  'jalna road': 'जालना रोड',
  'jalna-road': 'जालना रोड',
  'samarth nagar': 'समर्थ नगर',
  'samarth-nagar': 'समर्थ नगर',
  'aurangpura': 'औरंगपुरा',
  'shahgunj': 'शाहगंज',
  'gulmandi': 'गुलमंडी',
  'ulkanagari': 'उलकानगरी',
  'jyoti nagar': 'ज्योति नगर',
  'jyoti-nagar': 'ज्योति नगर',
  'bansilal nagar': 'बन्सीलाल नगर',
  'bansilal-nagar': 'बन्सीलाल नगर',
  'shreya nagar': 'श्रेया नगर',
  'shreya-nagar': 'श्रेया नगर',
  'satara parisar': 'सातारा परिसर',
  'satara-parisar': 'सातारा परिसर',
  'padegaon': 'पडेगांव',
  'harsul': 'हरसूल',
  'mukundwadi': 'मुकुंदवाडी',
  'naregaon': 'नारेगाव',
  'chikalthana': 'चिकलठाणा',
  'chikalthana midc': 'चिकलठाणा MIDC',
  'shendra midc': 'शेंद्रा MIDC',
  'shendra-midc': 'शेंद्रा MIDC',
  'begumpura': 'बेगमपुरा',
  'jadhavwadi': 'जाधववाडी',
  'pundlik nagar': 'पुंडलिक नगर',
  'pundlik-nagar': 'पुंडलिक नगर',
  'deolai': 'देवळाई',
  'chishtiya colony': 'चिश्तिया कॉलनी',
  'chishtiya-colony': 'चिश्तिया कॉलनी',
  'jawahar colony': 'जवाहर कॉलनी',
  'jawahar-colony': 'जवाहर कॉलनी',
  'station road': 'स्टेशन रोड',
  'station-road': 'स्टेशन रोड',
  'vedant nagar': 'वेदांत नगर',
  'vedant-nagar': 'वेदांत नगर',
  'bajaj nagar': 'बजाज नगर',
  'bajaj-nagar': 'बजाज नगर',
'nakshatrawadi': 'नक्षत्रवाडी',
'mondha naka': 'मोंढा नाका',
'mondha-naka': 'मोंढा नाका',
'bhavsinghpura': 'भवसिंहपुरा',
'mgm (mahatma gandhi mission)': 'एमजीएम (MGM)',
'mgm': 'एमजीएम (MGM)',
'nirala bazar': 'निराला बाजार',
'nirala-bazar': 'निराला बाजार',
'town centre': 'टाउन सेंटर',
  'town-centre': 'टाउन सेंटर',
  'mayur park': 'मयूर पार्क',
  'mayur-park': 'मयूर पार्क',
  'khadkeshwar': 'खडकेश्वर',
  'padampura': 'पदमपुरा',
  'dashmesh nagar': 'दशमेश नगर',
  'dashmesh-nagar': 'दशमेश नगर',
  'shahanurwadi': 'शाहनूरवाडी',
  'kotla colony': 'कोटला कॉलनी',
  'kotla-colony': 'कोटला कॉलनी',
  'itkheda': 'इटखेड़ा',
  'new usmanpura': 'न्यू उस्मानपुरा',
  'new-usmanpura': 'न्यू उस्मानपुरा',
  'seven hills': 'सेव्हन हिल्स',
  'seven-hills': 'सेव्हन हिल्स',
  'tilak nagar': 'तिलक नगर',
  'tilak-nagar': 'तिलक नगर',
  'kranti chowk': 'क्रांती चौक',
  'kranti-chowk': 'क्रांती चौक',
  'sillod road': 'सिलोड रोड',
  'sillod-road': 'सिलोड रोड',

};

export function translateEnum(value: string | number | null | undefined, language: Language): string {
  if (!value) return '';
  const str = String(value).trim();
  if (language !== 'marathi') return str;
  const key = str.toLowerCase();
  const dashed = key.replace(/\s+/g, '-');
  const spaced = key.replace(/-/g, ' ');
  return MAP[key] || MAP[dashed] || MAP[spaced] || str; // fallback to original if not mapped
}

// Static UI translations for Marathi fallback when cache/edge are unavailable
const STATIC_UI_MR: Record<string, string> = {
  // Notifications & actions
  'Notifications': 'सूचना',
  'Mark all read': 'सर्व वाचले म्हणून चिन्हांकित करा',
  'No notifications yet': 'अजून कोणत्याही सूचना नाहीत',
  'View Property': 'प्रॉपर्टी पहा',
  'Property Approved!': 'प्रॉपर्टी मंजूर!',
  'Property Under Review': 'प्रॉपर्टी पुनरावलोकनाधीन',
  'Property Featured!': 'प्रॉपर्टी फीचर्ड!',
  'Verification Submitted': 'पडताळणी सादर केली',
  'Verification Approved': 'पडताळणी मंजूर',
  'Verification Rejected': 'पडताळणी नाकारली',
  'Listing Activated': 'लिस्टिंग सक्रिय',
  'Listing Deactivated': 'लिस्टिंग निष्क्रिय',
  'Property Sold': 'प्रॉपर्टी विकली गेली',
  'Feature Request Approved': 'फीचर विनंती मंजूर',
  'Feature Request Rejected': 'फीचर विनंती नाकारली',

  // Profile / Account
  'Profile': 'प्रोफाइल',
  'Account Status': 'खाते स्थिती',
  'Full Name': 'पूर्ण नाव',
  'Email Address': 'ईमेल पत्ता',
  'Mobile Number': 'मोबाइल क्रमांक',
  'Contact Information': 'संपर्क माहिती',
  'Primary Contact': 'प्राथमिक संपर्क',
  'Primary mobile number': 'प्राथमिक मोबाइल क्रमांक',
  'Secondary Contacts': 'दुय्यम संपर्क',
  'Add Contact': 'संपर्क जोडा',
  'Save': 'जतन करा',
  'Cancel': 'रद्द करा',
  'Saved': 'जतन केले',
  'Welcome back,': 'पुन्हा स्वागत आहे,',

  // Status badges & states
  'Verified Property': 'सत्यापित प्रॉपर्टी',
  '✓ Verified': '✓ सत्यापित',
  'Verified': 'सत्यापित',
  'Not Verified': 'असत्यापित',
  'Unverified': 'असत्यापित',
  'Approved': 'मंजूर',
  'Pending': 'प्रलंबित',
  'Rejected': 'नाकारले',
  'Active': 'सक्रिय',
  'Inactive': 'निष्क्रिय',
  'Under Review': 'पुनरावलोकनाधीन',
  'Edit Request': 'विनंती संपादा',
  'Resubmit Verification': 'पडताळणी पुन्हा सादर करा',
  'Get Verified': 'सत्यापन मिळवा',
  'Request to be Featured': 'फीचर्ड करण्याची विनंती',
  'Featured Property': 'फीचर्ड प्रॉपर्टी',

  // Misc
  'Back to Home': 'मुख्यपृष्ठावर परत जा',
  'Back': 'मागे',
  'Dashboard': 'डॅशबोर्ड',
  'Properties': 'प्रॉपर्टीज',
  'Saved Properties': 'जतन केलेल्या प्रॉपर्टीज',
  'Approved Properties': 'मंजूर प्रॉपर्टीज',
  'view_details': 'तपशील पहा',
  'properties_page.title': 'सर्व प्रॉपर्टीज',
  'properties_page.description': 'आमच्या प्लॅटफॉर्मवर उपलब्ध सर्व प्रकारच्या प्रॉपर्टीज - निवासी, व्यावसायिक, खरेदी, भाडे आणि लीज शोधा',
};

export function getStaticTranslation(text: string, lang: Language, context?: string): string | null {
  if (lang !== 'marathi' || !text) return null;
  const trimmed = text.trim();

  // 1) Direct lookup
  if (STATIC_UI_MR[trimmed]) return STATIC_UI_MR[trimmed];

  // 2) Patterns for common notification messages
  // Approved
  const approvalRe = /^Your property "(.+)" has been approved and is now live\.$/;
  let m = trimmed.match(approvalRe);
  if (m) return `आपली प्रॉपर्टी "${m[1]}" मंजूर झाली आहे आणि आता लाईव्ह आहे.`;

  // Under review
  const underReviewRe = /^Your property "(.+)" is under review\.?$/;
  m = trimmed.match(underReviewRe);
  if (m) return `आपली प्रॉपर्टी "${m[1]}" पुनरावलोकनाधीन आहे.`;

  // Featured
  const featuredRe = /^Your property "(.+)" has been featured(?: until (.+))?\.?$/;
  m = trimmed.match(featuredRe);
  if (m) return m[2]
    ? `आपली प्रॉपर्टी "${m[1]}" फीचर्ड करण्यात आली आहे (पर्यंत: ${m[2]}).`
    : `आपली प्रॉपर्टी "${m[1]}" फीचर्ड करण्यात आली आहे.`;

  // Verification submitted
  const verSubmittedRe = /^Your verification request for "(.+)" has been submitted\.?$/;
  m = trimmed.match(verSubmittedRe);
  if (m) return `"${m[1]}" साठी आपली पडताळणी विनंती सादर केली आहे.`;

  // Verification approved
  const verApprovedRe = /^Your property "(.+)" has been verified\.?$/;
  m = trimmed.match(verApprovedRe);
  if (m) return `आपली प्रॉपर्टी "${m[1]}" सत्यापित झाली आहे.`;

  // Verification rejected
  const verRejectedRe1 = /^Your property "(.+)" verification was rejected\.?$/;
  const verRejectedRe2 = /^Your verification for "(.+)" has been rejected\.?$/;
  m = trimmed.match(verRejectedRe1) || trimmed.match(verRejectedRe2);
  if (m) return `आपल्या प्रॉपर्टी "${m[1]}" ची पडताळणी नाकारली गेली आहे.`;

  // Listing status changes
  const listingActiveRe = /^Your property "(.+)" listing is now active\.?$/;
  m = trimmed.match(listingActiveRe);
  if (m) return `आपल्या प्रॉपर्टी "${m[1]}" चे लिस्टिंग आता सक्रिय आहे.`;

  const listingInactiveRe = /^Your property "(.+)" listing is now inactive\.?$/;
  m = trimmed.match(listingInactiveRe);
  if (m) return `आपल्या प्रॉपर्टी "${m[1]}" चे लिस्टिंग आता निष्क्रिय आहे.`;

  // Sold
  const soldRe = /^Congrats! Your property "(.+)" is sold\.?$/;
  m = trimmed.match(soldRe);
  if (m) return `अभिनंदन! आपली प्रॉपर्टी "${m[1]}" विकली गेली आहे.`;

  // Feature request decisions
  const featReqApproved = /^Your feature request for "(.+)" was approved\.?$/;
  m = trimmed.match(featReqApproved);
  if (m) return `"${m[1]}" साठी तुमची फीचर विनंती मंजूर झाली आहे.`;

  const featReqRejected = /^Your feature request for "(.+)" was rejected\.?$/;
  m = trimmed.match(featReqRejected);
  if (m) return `"${m[1]}" साठी तुमची फीचर विनंती नाकारली गेली आहे.`;

  return null;
}
