import React, { useState } from "react";
import {
  BookOpen,
  AlertTriangle,
  Shield,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Smartphone,
  Briefcase,
  Link2,
  Heart,
  Globe,
  Lock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Lang = "en" | "hi";

interface BilingualText {
  en: string;
  hi: string;
}

interface ScamExample {
  en: string;
  hi: string;
}

interface EducationSection {
  id: string;
  icon: React.ReactNode;
  title: BilingualText;
  summary: BilingualText;
  content: BilingualText[];
  examples: ScamExample[];
  color: string;
}

// ─── Education Data ───────────────────────────────────────────────────────────

const sections: EducationSection[] = [
  {
    id: "upi",
    icon: <DollarSign className="w-6 h-6" />,
    color: "cyan",
    title: {
      en: "UPI Scams",
      hi: "UPI स्कैम",
    },
    summary: {
      en: "Fraudsters exploit UPI's ease to trick you into sending money.",
      hi: "धोखेबाज़ UPI की सुविधा का फायदा उठाकर आपसे पैसे ठगते हैं।",
    },
    content: [
      {
        en: "Never scan a QR code to RECEIVE money — QR codes only send money from your account.",
        hi: "पैसे प्राप्त करने के लिए कभी QR कोड स्कैन न करें — QR कोड हमेशा आपके खाते से पैसे भेजते हैं।",
      },
      {
        en: "Scammers send fake 'collect' requests claiming you won a prize or refund.",
        hi: "स्कैमर्स नकली 'कलेक्ट' अनुरोध भेजते हैं, यह कहते हुए कि आपने इनाम जीता है या रिफंड मिलेगा।",
      },
      {
        en: "Wrong transfer trick: They transfer a small amount then claim it was a mistake and ask for a larger return.",
        hi: "गलत ट्रांसफर ट्रिक: वे थोड़ी राशि भेजते हैं फिर दावा करते हैं यह गलती थी और ज़्यादा वापस माँगते हैं।",
      },
      {
        en: "Always verify the recipient's name carefully before confirming any UPI payment.",
        hi: "किसी भी UPI भुगतान की पुष्टि करने से पहले प्राप्तकर्ता का नाम ध्यान से जाँचें।",
      },
    ],
    examples: [
      {
        en: "\"Congratulations! You've won ₹50,000. Scan this QR to claim your reward.\"",
        hi: "\"बधाई हो! आपने ₹50,000 जीते। अपना इनाम पाने के लिए यह QR स्कैन करें।\"",
      },
      {
        en: "\"I accidentally sent ₹5,000 to your account. Please return ₹10,000 as my account is linked.\"",
        hi: "\"मैंने गलती से ₹5,000 आपके खाते में भेज दिए। कृपया ₹10,000 वापस करें क्योंकि मेरा खाता लिंक है।\"",
      },
    ],
  },
  {
    id: "otp",
    icon: <Smartphone className="w-6 h-6" />,
    color: "orange",
    title: {
      en: "OTP Fraud",
      hi: "OTP धोखाधड़ी",
    },
    summary: {
      en: "Your OTP is your digital signature — sharing it is like handing over your bank PIN.",
      hi: "आपका OTP आपका डिजिटल हस्ताक्षर है — इसे शेयर करना अपना बैंक PIN देने जैसा है।",
    },
    content: [
      {
        en: "NEVER share your OTP with anyone — not even bank employees, customer care, or government officials.",
        hi: "कभी भी किसी के साथ OTP शेयर न करें — बैंक कर्मचारी, ग्राहक सेवा, या सरकारी अधिकारी को भी नहीं।",
      },
      {
        en: "Banks explicitly state: 'Your bank will NEVER ask for your OTP over the phone.'",
        hi: "बैंक स्पष्ट रूप से कहते हैं: 'आपका बैंक फोन पर कभी OTP नहीं माँगेगा।'",
      },
      {
        en: "Scammers use social engineering, pretending to verify your account or process a refund.",
        hi: "स्कैमर्स सोशल इंजीनियरिंग का उपयोग करते हैं, खाते की पुष्टि करने या रिफंड देने का नाटक करते हैं।",
      },
      {
        en: "If you shared an OTP by mistake, immediately call your bank's helpline and freeze your account.",
        hi: "अगर आपने गलती से OTP शेयर किया, तुरंत अपने बैंक की हेल्पलाइन पर कॉल करें और खाता फ्रीज़ करें।",
      },
    ],
    examples: [
      {
        en: "\"I'm calling from SBI. Your account is at risk. Please share the OTP sent to verify your identity.\"",
        hi: "\"मैं SBI से बोल रहा हूँ। आपका खाता खतरे में है। कृपया पहचान सत्यापित करने के लिए OTP शेयर करें।\"",
      },
      {
        en: "\"Your UPI refund of ₹2,000 is ready. Share the OTP received to process it.\"",
        hi: "\"आपका ₹2,000 का UPI रिफंड तैयार है। इसे प्रोसेस करने के लिए प्राप्त OTP शेयर करें।\"",
      },
    ],
  },
  {
    id: "kyc",
    icon: <Shield className="w-6 h-6" />,
    color: "yellow",
    title: {
      en: "Fake KYC Messages",
      hi: "नकली KYC संदेश",
    },
    summary: {
      en: "No bank or telecom will ever block your account/SIM via SMS for KYC updates.",
      hi: "कोई भी बैंक या टेलीकॉम KYC अपडेट के लिए SMS से आपका खाता/SIM ब्लॉक नहीं करेगा।",
    },
    content: [
      {
        en: "Legitimate banks conduct KYC through official branch visits or verified bank apps — never via SMS links.",
        hi: "वैध बैंक आधिकारिक शाखा दौरों या सत्यापित बैंक ऐप्स के माध्यम से KYC करते हैं — SMS लिंक के माध्यम से कभी नहीं।",
      },
      {
        en: "SMS claiming 'Your account will be blocked in 24 hours — update KYC' are 100% scams.",
        hi: "SMS जो कहता है 'आपका खाता 24 घंटे में बंद हो जाएगा — KYC अपडेट करें' 100% स्कैम है।",
      },
      {
        en: "Never click on links in SMS messages claiming to be from your bank.",
        hi: "अपने बैंक से होने का दावा करने वाले SMS संदेशों में लिंक पर कभी क्लिक न करें।",
      },
      {
        en: "If concerned, walk into your nearest bank branch with your original documents.",
        hi: "यदि चिंता है, तो अपने मूल दस्तावेज़ों के साथ अपने निकटतम बैंक शाखा में जाएं।",
      },
    ],
    examples: [
      {
        en: "\"Your HDFC account will be suspended. Complete KYC now: [fake-hdfc-kyc.com/update]\"",
        hi: "\"आपका HDFC खाता निलंबित हो जाएगा। अभी KYC पूरी करें: [fake-hdfc-kyc.com/update]\"",
      },
      {
        en: "\"Airtel: Your SIM will be deactivated in 24 hours. Update KYC to avoid disruption.\"",
        hi: "\"Airtel: आपका SIM 24 घंटे में निष्क्रिय हो जाएगा। व्यवधान से बचने के लिए KYC अपडेट करें।\"",
      },
    ],
  },
  {
    id: "digital-arrest",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "red",
    title: {
      en: "Digital Arrest Scam",
      hi: "डिजिटल गिरफ्तारी स्कैम",
    },
    summary: {
      en: "'Digital Arrest' does NOT exist in Indian law — it is a scam, period.",
      hi: "'डिजिटल गिरफ्तारी' भारतीय कानून में मौजूद नहीं है — यह बिल्कुल एक स्कैम है।",
    },
    content: [
      {
        en: "There is NO such thing as 'Digital Arrest' in India. CBI, ED, Narcotics, or Police CANNOT arrest you over a video call.",
        hi: "भारत में 'डिजिटल गिरफ्तारी' जैसी कोई चीज़ नहीं है। CBI, ED, नारकोटिक्स, या पुलिस वीडियो कॉल पर आपको गिरफ्तार नहीं कर सकते।",
      },
      {
        en: "Scammers pose as senior officers in uniforms with fake office backgrounds to create fear.",
        hi: "स्कैमर्स वर्दी में वरिष्ठ अधिकारियों के रूप में नकली कार्यालय पृष्ठभूमि के साथ डर पैदा करते हैं।",
      },
      {
        en: "They demand money to 'clear your name' from fake drug/money laundering cases.",
        hi: "वे नकली ड्रग/मनी लॉन्ड्रिंग मामलों से 'आपका नाम साफ़ करने' के लिए पैसे माँगते हैं।",
      },
      {
        en: "If you receive such a call: Hang up immediately. Inform local police. Call 1930.",
        hi: "यदि आपको ऐसी कॉल आती है: तुरंत फोन काटें। स्थानीय पुलिस को सूचित करें। 1930 पर कॉल करें।",
      },
    ],
    examples: [
      {
        en: "\"I'm DCP Sharma from CBI Cyber Cell. A drug parcel in your name was seized. Pay ₹2 lakh bail or face Digital Arrest.\"",
        hi: "\"मैं CBI साइबर सेल से DCP शर्मा बोल रहा हूँ। आपके नाम पर ड्रग पार्सल जब्त किया गया। ₹2 लाख ज़मानत दें या डिजिटल गिरफ्तारी का सामना करें।\"",
      },
      {
        en: "\"Stay on this video call for 4 hours or you will be arrested. This is your Digital Custody notice.\"",
        hi: "\"4 घंटे तक इस वीडियो कॉल पर रहें या आपको गिरफ्तार किया जाएगा। यह आपकी डिजिटल कस्टडी नोटिस है।\"",
      },
    ],
  },
  {
    id: "jobs",
    icon: <Briefcase className="w-6 h-6" />,
    color: "purple",
    title: {
      en: "Fake Job Offers",
      hi: "नकली नौकरी के प्रस्ताव",
    },
    summary: {
      en: "Work-from-home scams and advance fee fraud target the unemployed and students.",
      hi: "वर्क-फ्रॉम-होम स्कैम और अग्रिम शुल्क धोखाधड़ी बेरोजगारों और छात्रों को निशाना बनाती है।",
    },
    content: [
      {
        en: "Legitimate employers NEVER ask for money upfront for registration, training, or ID verification.",
        hi: "वैध नियोक्ता कभी भी पंजीकरण, प्रशिक्षण, या पहचान सत्यापन के लिए पहले से पैसे नहीं माँगते।",
      },
      {
        en: "WFH scam: 'Earn ₹500 per task by liking YouTube videos' — these schemes steal your money through fake investments.",
        hi: "WFH स्कैम: 'YouTube वीडियो लाइक करके प्रति कार्य ₹500 कमाएं' — ये योजनाएं नकली निवेश के माध्यम से आपका पैसा चुराती हैं।",
      },
      {
        en: "Advance fee fraud: They 'hire' you, then ask for security deposit, uniform cost, or background check fees.",
        hi: "अग्रिम शुल्क धोखाधड़ी: वे आपको 'नियुक्त' करते हैं, फिर सुरक्षा जमा, वर्दी लागत, या पृष्ठभूमि जाँच शुल्क माँगते हैं।",
      },
      {
        en: "Always verify job offers through the company's official website and physical office.",
        hi: "हमेशा कंपनी की आधिकारिक वेबसाइट और भौतिक कार्यालय के माध्यम से नौकरी के प्रस्तावों की जाँच करें।",
      },
    ],
    examples: [
      {
        en: "\"Work from home! Earn ₹25,000/month. Just pay ₹2,000 registration fee to start.\"",
        hi: "\"घर से काम करें! ₹25,000/माह कमाएं। शुरू करने के लिए बस ₹2,000 पंजीकरण शुल्क दें।\"",
      },
      {
        en: "\"You are selected for Amazon Data Entry. Pay ₹5,000 for ID card and uniform to join.\"",
        hi: "\"आप Amazon डेटा एंट्री के लिए चुने गए हैं। जुड़ने के लिए ID कार्ड और वर्दी के लिए ₹5,000 दें।\"",
      },
    ],
  },
  {
    id: "phishing",
    icon: <Link2 className="w-6 h-6" />,
    color: "teal",
    title: {
      en: "Phishing Links",
      hi: "फ़िशिंग लिंक",
    },
    summary: {
      en: "Fake URLs mimic real websites to steal your credentials and financial data.",
      hi: "नकली URL आपकी क्रेडेंशियल और वित्तीय डेटा चुराने के लिए असली वेबसाइटों की नकल करते हैं।",
    },
    content: [
      {
        en: "Check the domain carefully: 'sbi-online-secure.com' is NOT the real SBI (onlinesbi.sbi is official).",
        hi: "डोमेन को ध्यान से जाँचें: 'sbi-online-secure.com' असली SBI नहीं है (onlinesbi.sbi आधिकारिक है)।",
      },
      {
        en: "Look for HTTPS padlock, but note that even scam sites can have SSL — always check the domain name itself.",
        hi: "HTTPS पैडलॉक देखें, लेकिन ध्यान दें कि स्कैम साइटों के पास भी SSL हो सकता है — हमेशा डोमेन नाम की जाँच करें।",
      },
      {
        en: "Hover over links before clicking to see the actual URL destination in your browser's status bar.",
        hi: "क्लिक करने से पहले लिंक पर होवर करें ताकि ब्राउज़र के स्टेटस बार में वास्तविक URL गंतव्य दिखे।",
      },
      {
        en: "Typosquatting tricks: 'amaz0n.in', 'g00gle.com', 'paytm-official.net' — all fake.",
        hi: "टाइपोस्क्वाटिंग ट्रिक्स: 'amaz0n.in', 'g00gle.com', 'paytm-official.net' — सभी नकली।",
      },
    ],
    examples: [
      {
        en: "\"Your IRCTC booking is confirmed. Claim ₹200 cashback: [irctc-cashback-offer.xyz/claim]\"",
        hi: "\"आपकी IRCTC बुकिंग की पुष्टि हो गई। ₹200 कैशबैक क्लेम करें: [irctc-cashback-offer.xyz/claim]\"",
      },
      {
        en: "\"Income Tax Refund of ₹15,320 approved. Fill form: [incometax-refund-portal.com]\"",
        hi: "\"₹15,320 का आयकर रिफंड स्वीकृत। फॉर्म भरें: [incometax-refund-portal.com]\"",
      },
    ],
  },
  {
    id: "banking",
    icon: <Lock className="w-6 h-6" />,
    color: "green",
    title: {
      en: "Safe Online Banking",
      hi: "सुरक्षित ऑनलाइन बैंकिंग",
    },
    summary: {
      en: "Simple habits can protect your financial life from cyber criminals.",
      hi: "सरल आदतें आपके वित्तीय जीवन को साइबर अपराधियों से बचा सकती हैं।",
    },
    content: [
      {
        en: "Use strong, unique passwords for banking. Enable Two-Factor Authentication (2FA) everywhere.",
        hi: "बैंकिंग के लिए मजबूत, अद्वितीय पासवर्ड का उपयोग करें। हर जगह टू-फैक्टर ऑथेंटिकेशन (2FA) सक्षम करें।",
      },
      {
        en: "Never access your bank on public Wi-Fi. Use mobile data or a trusted VPN.",
        hi: "सार्वजनिक Wi-Fi पर कभी अपना बैंक एक्सेस न करें। मोबाइल डेटा या विश्वसनीय VPN का उपयोग करें।",
      },
      {
        en: "Set low transaction limits and enable SMS/email alerts for every transaction.",
        hi: "कम लेनदेन सीमा निर्धारित करें और हर लेनदेन के लिए SMS/ईमेल अलर्ट सक्षम करें।",
      },
      {
        en: "Regularly review your bank statements. Report unrecognized transactions within 3 days for zero liability.",
        hi: "नियमित रूप से अपने बैंक स्टेटमेंट की समीक्षा करें। शून्य दायित्व के लिए 3 दिनों के भीतर अज्ञात लेनदेन की रिपोर्ट करें।",
      },
    ],
    examples: [
      {
        en: "Scammer installs screen-sharing app (AnyDesk/TeamViewer) pretending to help fix a banking issue.",
        hi: "स्कैमर बैंकिंग समस्या ठीक करने का नाटक करते हुए स्क्रीन-शेयरिंग ऐप (AnyDesk/TeamViewer) इंस्टॉल करता है।",
      },
      {
        en: "Fake bank customer care numbers appear on Google — always call numbers on the back of your debit card.",
        hi: "Google पर नकली बैंक कस्टमर केयर नंबर दिखाई देते हैं — हमेशा अपने डेबिट कार्ड के पीछे के नंबर पर कॉल करें।",
      },
    ],
  },
  {
    id: "social",
    icon: <Heart className="w-6 h-6" />,
    color: "pink",
    title: {
      en: "Social Media Scams",
      hi: "सोशल मीडिया स्कैम",
    },
    summary: {
      en: "Romance scams and fake profiles exploit trust and emotions to steal money.",
      hi: "रोमांस स्कैम और नकली प्रोफाइल पैसे चुराने के लिए विश्वास और भावनाओं का फायदा उठाते हैं।",
    },
    content: [
      {
        en: "Romance scammers build emotional relationships over weeks/months before asking for money ('stuck abroad', 'medical emergency').",
        hi: "रोमांस स्कैमर्स पैसे माँगने से पहले हफ्तों/महीनों तक भावनात्मक संबंध बनाते हैं ('विदेश में फँसा', 'चिकित्सा आपात स्थिति')।",
      },
      {
        en: "Fake celebrity/lottery accounts: 'Amitabh Bachchan's official team' claiming you won a contest.",
        hi: "नकली सेलिब्रिटी/लॉटरी खाते: 'अमिताभ बच्चन की आधिकारिक टीम' जो दावा करती है कि आपने प्रतियोगिता जीती।",
      },
      {
        en: "Sextortion: Someone befriends you, shares intimate content, then blackmails with threats to share your photos.",
        hi: "सेक्सटॉर्शन: कोई आपसे दोस्ती करता है, अंतरंग सामग्री शेयर करता है, फिर आपकी तस्वीरें शेयर करने की धमकी से ब्लैकमेल करता है।",
      },
      {
        en: "Use reverse image search (Google Lens) to verify profile photos of unknown online contacts.",
        hi: "अज्ञात ऑनलाइन संपर्कों की प्रोफाइल तस्वीरें सत्यापित करने के लिए रिवर्स इमेज सर्च (Google Lens) का उपयोग करें।",
      },
    ],
    examples: [
      {
        en: "\"I'm an Indian Army officer posted abroad. I need ₹30,000 to ship my belongings home. I'll pay back double.\"",
        hi: "\"मैं विदेश में तैनात भारतीय सेना अधिकारी हूँ। मुझे अपना सामान घर भेजने के लिए ₹30,000 चाहिए। मैं दोगुना वापस करूँगा।\"",
      },
      {
        en: "\"Congratulations! You've been selected by KBC. Pay ₹5,000 processing fee to claim ₹25 lakh prize.\"",
        hi: "\"बधाई हो! आप KBC द्वारा चुने गए हैं। ₹25 लाख पुरस्कार पाने के लिए ₹5,000 प्रोसेसिंग शुल्क दें।\"",
      },
    ],
  },
];

// ─── Color Map ────────────────────────────────────────────────────────────────

const colorMap: Record<string, { border: string; bg: string; icon: string; badge: string }> = {
  cyan:   { border: "border-cyan-500/40",   bg: "bg-cyan-500/10",   icon: "text-cyan-400",   badge: "bg-cyan-500/20 text-cyan-300" },
  orange: { border: "border-orange-500/40", bg: "bg-orange-500/10", icon: "text-orange-400", badge: "bg-orange-500/20 text-orange-300" },
  yellow: { border: "border-yellow-500/40", bg: "bg-yellow-500/10", icon: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-300" },
  red:    { border: "border-red-500/40",    bg: "bg-red-500/10",    icon: "text-red-400",    badge: "bg-red-500/20 text-red-300" },
  purple: { border: "border-purple-500/40", bg: "bg-purple-500/10", icon: "text-purple-400", badge: "bg-purple-500/20 text-purple-300" },
  teal:   { border: "border-teal-500/40",   bg: "bg-teal-500/10",   icon: "text-teal-400",   badge: "bg-teal-500/20 text-teal-300" },
  green:  { border: "border-green-500/40",  bg: "bg-green-500/10",  icon: "text-green-400",  badge: "bg-green-500/20 text-green-300" },
  pink:   { border: "border-pink-500/40",   bg: "bg-pink-500/10",   icon: "text-pink-400",   badge: "bg-pink-500/20 text-pink-300" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionCardProps {
  section: EducationSection;
  lang: Lang;
}

const SectionCard: React.FC<SectionCardProps> = ({ section, lang }) => {
  const [open, setOpen] = useState(false);
  const colors = colorMap[section.color];

  return (
    <div
      className={`rounded-2xl border ${colors.border} bg-slate-900/80 backdrop-blur-sm overflow-hidden transition-all duration-300`}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left group hover:bg-white/5 transition-colors duration-200"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.icon}`}>
            {section.icon}
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold text-base">
              {section.title[lang]}
            </h3>
            <p className="text-slate-400 text-sm mt-0.5 leading-snug max-w-sm">
              {section.summary[lang]}
            </p>
          </div>
        </div>
        <div className={`ml-3 flex-shrink-0 ${colors.icon} transition-transform duration-200 ${open ? "rotate-0" : ""}`}>
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expandable Body */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`px-5 pb-5 border-t ${colors.border} pt-4 space-y-4`}>
          {/* Key Points */}
          <ul className="space-y-2">
            {section.content.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.icon} bg-current`} />
                {point[lang]}
              </li>
            ))}
          </ul>

          {/* Scam Examples */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colors.icon}`}>
              {lang === "en" ? "⚠ Real Scam Examples" : "⚠ असली स्कैम उदाहरण"}
            </p>
            <div className="space-y-2">
              {section.examples.map((ex, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 ${colors.bg} border ${colors.border} text-sm text-slate-300 italic`}
                >
                  {ex[lang]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SafetyEducation: React.FC = () => {
  const [lang, setLang] = useState<Lang>("en");

  const t = {
    hero_title: { en: "Cyber Safety Education", hi: "साइबर सुरक्षा शिक्षा" },
    hero_sub: {
      en: "Stay informed. Stay protected. Learn to recognize and avoid digital scams.",
      hi: "सूचित रहें। सुरक्षित रहें। डिजिटल स्कैम को पहचानना और बचना सीखें।",
    },
    emergency_title: {
      en: "Immediate Help for Cyber Fraud Victims",
      hi: "साइबर धोखाधड़ी पीड़ितों के लिए तत्काल सहायता",
    },
    emergency_sub: {
      en: "Act fast! Every minute counts when you've been scammed.",
      hi: "तेज़ी से कार्य करें! स्कैम होने पर हर मिनट मायने रखता है।",
    },
    step1: { en: "Call 1930 immediately", hi: "तुरंत 1930 पर कॉल करें" },
    step1_sub: {
      en: "National Cybercrime Helpline — available 24/7. Report the fraud to freeze the transaction.",
      hi: "राष्ट्रीय साइबर अपराध हेल्पलाइन — 24/7 उपलब्ध। लेनदेन फ्रीज़ करने के लिए धोखाधड़ी की रिपोर्ट करें।",
    },
    step2: { en: "File complaint at cybercrime.gov.in", hi: "cybercrime.gov.in पर शिकायत दर्ज करें" },
    step2_sub: {
      en: "Submit an online complaint with transaction details, screenshots, and contact info.",
      hi: "लेनदेन विवरण, स्क्रीनशॉट और संपर्क जानकारी के साथ ऑनलाइन शिकायत दर्ज करें।",
    },
    step3: { en: "Contact your bank", hi: "अपने बैंक से संपर्क करें" },
    step3_sub: {
      en: "Call your bank's fraud helpline immediately to freeze your account and initiate chargeback.",
      hi: "अपने खाते को फ्रीज़ करने और चार्जबैक शुरू करने के लिए तुरंत अपने बैंक की फ्रॉड हेल्पलाइन पर कॉल करें।",
    },
    resources_title: { en: "Official Resources", hi: "आधिकारिक संसाधन" },
    resources_sub: {
      en: "Verified government and regulatory portals for cyber safety.",
      hi: "साइबर सुरक्षा के लिए सत्यापित सरकारी और नियामक पोर्टल।",
    },
    sections_title: { en: "Scam Awareness Guide", hi: "स्कैम जागरूकता गाइड" },
    sections_sub: {
      en: "Tap each section to learn about common cyber threats and how to stay safe.",
      hi: "सामान्य साइबर खतरों और सुरक्षित रहने के तरीके जानने के लिए प्रत्येक अनुभाग टैप करें।",
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a0f1e] to-slate-900 border-b border-slate-800/60">
        {/* Background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14">
          {/* Language Toggle */}
          <div className="flex justify-end mb-8">
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/50 rounded-xl p-1">
              <button
                onClick={() => setLang("en")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  lang === "en"
                    ? "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                English
              </button>
              <button
                onClick={() => setLang("hi")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  lang === "hi"
                    ? "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="flex-shrink-0 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <BookOpen className="w-10 h-10 text-cyan-400" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t.hero_title[lang]}
              </h1>
              <p className="mt-3 text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
                {t.hero_sub[lang]}
              </p>
              {/* Stats row */}
              <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                {[
                  { label: lang === "en" ? "Topics Covered" : "विषय", value: "8" },
                  { label: lang === "en" ? "Real Examples" : "असली उदाहरण", value: "16+" },
                  { label: lang === "en" ? "Bilingual" : "द्विभाषी", value: "✓" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-cyan-400 font-bold">{s.value}</span>
                    <span className="text-slate-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-14">

        {/* ── Emergency Help ──────────────────────────────────────────── */}
        <section>
          <div className="rounded-2xl border border-red-500/40 bg-red-500/5 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-red-500/30 bg-red-500/10">
              <div className="p-2 rounded-xl bg-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-300">{t.emergency_title[lang]}</h2>
                <p className="text-red-400/80 text-sm">{t.emergency_sub[lang]}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="p-6 grid sm:grid-cols-3 gap-5">
              {/* Step 1 */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500 text-white text-sm font-bold">1</span>
                  <span className="text-red-300 font-semibold text-sm">{t.step1[lang]}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{t.step1_sub[lang]}</p>
                <a
                  href="tel:1930"
                  className="mt-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm shadow-lg shadow-red-500/30"
                >
                  <Phone className="w-4 h-4" />
                  Call 1930
                </a>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500 text-white text-sm font-bold">2</span>
                  <span className="text-red-300 font-semibold text-sm">{t.step2[lang]}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{t.step2_sub[lang]}</p>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm border border-slate-600"
                >
                  <ExternalLink className="w-4 h-4" />
                  cybercrime.gov.in
                </a>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500 text-white text-sm font-bold">3</span>
                  <span className="text-red-300 font-semibold text-sm">{t.step3[lang]}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{t.step3_sub[lang]}</p>
                <div className="mt-auto flex items-center justify-center gap-2 bg-slate-800 text-slate-300 font-medium py-2.5 px-4 rounded-xl text-sm border border-slate-700">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  {lang === "en" ? "Use card's back number" : "कार्ड के पीछे का नंबर"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Accordion Sections ──────────────────────────────────────── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-100">{t.sections_title[lang]}</h2>
            <p className="text-slate-400 mt-1 text-sm">{t.sections_sub[lang]}</p>
          </div>
          <div className="space-y-3">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} lang={lang} />
            ))}
          </div>
        </section>

        {/* ── Official Resources ──────────────────────────────────────── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-100">{t.resources_title[lang]}</h2>
            <p className="text-slate-400 mt-1 text-sm">{t.resources_sub[lang]}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Cybercrime Helpline */}
            <a
              href="tel:1930"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  {lang === "en" ? "Cybercrime Helpline" : "साइबर अपराध हेल्पलाइन"}
                </p>
                <p className="text-2xl font-bold text-cyan-400 mt-0.5">1930</p>
                <p className="text-slate-400 text-xs mt-1">
                  {lang === "en" ? "National helpline — 24/7 support" : "राष्ट्रीय हेल्पलाइन — 24/7 सहायता"}
                </p>
              </div>
            </a>

            {/* Cybercrime Portal */}
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  {lang === "en" ? "National Cybercrime Portal" : "राष्ट्रीय साइबर अपराध पोर्टल"}
                </p>
                <p className="text-blue-400 text-sm font-medium mt-0.5">cybercrime.gov.in</p>
                <p className="text-slate-400 text-xs mt-1">
                  {lang === "en" ? "File online complaints & track status" : "ऑनलाइन शिकायत दर्ज करें और स्थिति ट्रैक करें"}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors ml-auto mt-1" />
            </a>

            {/* RBI SafePay */}
            <a
              href="https://rbi.org.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-700/50 hover:border-green-500/50 hover:bg-slate-800/80 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400 group-hover:bg-green-500/20 transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">RBI SafePay</p>
                <p className="text-green-400 text-sm font-medium mt-0.5">rbi.org.in</p>
                <p className="text-slate-400 text-xs mt-1">
                  {lang === "en"
                    ? "Reserve Bank of India — safe digital payment guidelines"
                    : "भारतीय रिजर्व बैंक — सुरक्षित डिजिटल भुगतान दिशानिर्देश"}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-green-400 transition-colors ml-auto mt-1" />
            </a>

            {/* MHA Cyber Division */}
            <a
              href="https://www.mha.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-700/50 hover:border-orange-500/50 hover:bg-slate-800/80 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  {lang === "en" ? "MHA Cyber Division" : "MHA साइबर विभाग"}
                </p>
                <p className="text-orange-400 text-sm font-medium mt-0.5">mha.gov.in</p>
                <p className="text-slate-400 text-xs mt-1">
                  {lang === "en"
                    ? "Ministry of Home Affairs — I4C cyber safety initiatives"
                    : "गृह मंत्रालय — I4C साइबर सुरक्षा पहल"}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors ml-auto mt-1" />
            </a>
          </div>
        </section>

        {/* ── Footer note ─────────────────────────────────────────────── */}
        <div className="text-center pb-6">
          <p className="text-slate-500 text-xs">
            {lang === "en"
              ? "ScamShield is a public awareness initiative. Always verify information with official government sources."
              : "ScamShield एक सार्वजनिक जागरूकता पहल है। हमेशा आधिकारिक सरकारी स्रोतों से जानकारी सत्यापित करें।"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyEducation;
