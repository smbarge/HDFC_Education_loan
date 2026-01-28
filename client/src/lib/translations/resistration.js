// src/lib/translations/resistration.js
import { currentLanguage } from '$lib/stores/language';

// Re-export the shared store (no need to create a new one)
export const currentLang = currentLanguage;

export const i18n = {
  translations: {
    en: {
      // Login translations
      login: {
        title: 'Sign In to Your Account',
        subtitle: 'Enter your credentials to access your account',
        username: 'Username / Mobile Number',
        usernamePlaceholder: 'Enter username or mobile number',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot Password?',
        signIn: 'Sign In',
        noAccount: "Don't have an account?",
        registerNow: 'Register Now',
        secureLogin: 'Secure Login',
        loginSecure: 'Your login is secure',
        protectedBy: 'Protected by Government of Maharashtra security standards',
        welcomeBack: 'Welcome Back!',
        accessAccount: 'Access your account to manage your education loan applications and track your progress.'
        
      },
      step1: {
        title: 'Create Your Account',
        fullName: 'Full Name',
        fullNamePlaceholder: 'Enter your full name',
        mobile: 'Mobile Number',
        mobilePlaceholder: 'Enter 10-digit mobile number',
        sendCode: 'Send Verification Code',
        alreadyAccount: 'Already have an account?',
        login: 'Login',
        Government_Initiative :'Government Initiative',
        Register_to_apply_for_an_education_loan : 'Register to apply for an education loan',
        Your_data_is_protected_by_Government_of_Maharashtra_security_standards : 'Your data is protected by Government of Maharashtra security standards',
        We_never_share_your_personal_information_with_third_parties : 'We never share your personal information with third parties',
        Education_Loan_for_Minority_Communities : 'Education Loan for Minority Communities',
        Register_now_to_apply_for_education_loans :'Register now to apply for education loans up to ₹5,00,000 with subsidized interest rates',
        Mobile_No_and_Name :'Mobile No. & Name',
        OTP_Verification :'OTP Verification',
        Create_Account : 'Create Account',
        Completed :'Completed'
      },
      step2: {
        title: 'Verify Your Mobile',
        otpSent: 'Enter the 6-digit OTP sent to',
        enterOtp: 'Enter OTP',
        otpPlaceholder: 'Enter 6-digit OTP',
        verifyOtp: 'Verify OTP',
        didntReceive: "Didn't receive the code?",
        resendOtp: 'Resend OTP',
        resendIn: 'Resend in',
        otpValid: 'OTP is valid for 10 minutes',
        otpExpire: 'Please enter the code before it expires',
        Secure_Verification :'Secure Verification',
        Back_to_Registration : 'Back to Registration'
      },
      step3: {
        title: 'Create Account',
        username: 'Username (Mobile Number)',
        password: 'Create Password',
        passwordPlaceholder: 'Enter password',
        confirmPassword: 'Confirm Password',
        confirmPasswordPlaceholder: 'Re-enter password',
        createAccount: 'Create Account',
        passwordRequirements: 'Password Requirements',
        requirement1: 'At least 6 characters long',
        requirement2: 'Contains at least one number',
        requirement3: 'Contains at least one special character',
        Set_up_your_account_credentials : 'Set up your account credentials',
        Secure_Account :'Secure Account',
        Back_to_OTP_Verification: 'Back to OTP Verification',

      },
      step4: {
        success: 'Account Created Successfully!',
        welcome: 'Welcome to',
        companyName: 'MAMFDC Education Loan Portal',
        signIn: 'Sign In to Your Account',
        description: 'Start your education loan application journey with us',
        Registration_Successful :'Registration Successful',
        You_can_now_login_with_your_credentials_to_access_your_account_and_apply_for_education_loans :'You can now login with your credentials to access your account and apply for education loans.'
      },
      errors: {
        nameRequired: 'Name is required',
        nameMinLength: 'Name must be at least 3 characters',
        mobileRequired: 'Mobile number is required',
        mobileDigits: 'Mobile number must contain only digits',
        mobileStart: 'Mobile number must start with 6, 7, 8, or 9',
        mobileLength: 'Mobile number must be exactly 10 digits',
        otpRequired: 'OTP is required',
        otpLength: 'OTP must be exactly 6 digits',
        otpDigits: 'OTP must contain only digits',
        passwordRequired: 'Password is required',
        passwordMinLength: 'Password must be at least 6 characters',
        passwordSpecial: 'Password must contain at least one special character',
        passwordNumber: 'Password must contain at least one number',
        confirmPasswordRequired: 'Please confirm your password',
        confirmPasswordMinLength: 'Password must be at least 6 characters',
        confirmPasswordMatch: 'Passwords do not match',
        usernameRequired: 'Username is required'
      }
    },
    hi: {
      // Login translations
      login: {
        title: 'अपने खाते में साइन इन करें',
        subtitle: 'अपने खाते तक पहुंचने के लिए अपनी साख दर्ज करें',
        username: 'उपयोगकर्ता नाम / मोबाइल नंबर',
        usernamePlaceholder: 'उपयोगकर्ता नाम या मोबाइल नंबर दर्ज करें',
        password: 'पासवर्ड',
        passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
        rememberMe: 'मुझे याद रखें',
        forgotPassword: 'पासवर्ड भूल गए?',
        signIn: 'साइन इन करें',
        noAccount: 'खाता नहीं है?',
        registerNow: 'अभी रजिस्टर करें',
        secureLogin: 'सुरक्षित लॉगिन',
        loginSecure: 'आपका लॉगिन सुरक्षित है',
        protectedBy: 'महाराष्ट्र सरकार की सुरक्षा मानकों द्वारा संरक्षित',
        welcomeBack: 'वापसी पर स्वागत है!',
        accessAccount: 'अपने शिक्षा ऋण आवेदनों को प्रबंधित करने और अपनी प्रगति को ट्रैक करने के लिए अपने खाते तक पहुंचें।'
        
      },
      step1: {
        title: 'अपना खाता बनाएं',
        fullName: 'पूरा नाम',
        fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
        mobile: 'मोबाइल नंबर',
        mobilePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
        sendCode: 'सत्यापन कोड भेजें',
        alreadyAccount: 'पहले से खाता है?',
        login: 'लॉगिन करें',
        Government_Initiative: 'सरकारी पहल',
        Register_to_apply_for_an_education_loan : 'शिक्षा ऋण के लिए आवेदन करने हेतु पंजीकरण करें|',
        Your_data_is_protected_by_Government_of_Maharashtra_security_standards : 'आपका डेटा महाराष्ट्र सरकार के सुरक्षा मानकों द्वारा सुरक्षित है|',
        We_never_share_your_personal_information_with_third_parties : 'हम आपकी व्यक्तिगत जानकारी कभी भी किसी तीसरे पक्ष के साथ साझा नहीं करते हैं|',
        Education_Loan_for_Minority_Communities : 'अल्पसंख्यक समुदायों के लिए शिक्षा ऋण',
        Register_now_to_apply_for_education_loans:'सब्सिडी युक्त ब्याज दरों पर ₹5,00,000 तक के शिक्षा ऋण के लिए अभी पंजीकरण करें',
        Mobile_No_and_Name :'मोबाइल नंबर और नाम',
        OTP_Verification :'ओटीपी सत्यापन',
        Create_Account : 'खाता बनाएँ',
        Completed :'पूर्ण हुआ'
      },
      step2: {
        title: 'अपने मोबाइल को सत्यापित करें',
        otpSent: 'भेजे गए 6 अंकों का OTP दर्ज करें',
        enterOtp: 'OTP दर्ज करें',
        otpPlaceholder: '6 अंकों का OTP दर्ज करें',
        verifyOtp: 'OTP सत्यापित करें',
        didntReceive: 'कोड प्राप्त नहीं हुआ?',
        resendOtp: 'OTP पुनः भेजें',
        resendIn: 'में पुनः भेजें',
        otpValid: 'OTP 10 मिनट के लिए वैध है',
        otpExpire: 'कृपया समाप्त होने से पहले कोड दर्ज करें',
        Secure_Verification :'सुरक्षित सत्यापन',
        Back_to_Registration : 'पंजीकरण पर वापस जाएँ',
        Secure_Account : 'अपने खाते के क्रेडेंशियल सेट करें'
      },
      step3: {
        title: 'खाता बनाएं',
        username: 'उपयोगकर्ता नाम (मोबाइल नंबर)',
        password: 'पासवर्ड बनाएं',
        passwordPlaceholder: 'पासवर्ड दर्ज करें',
        confirmPassword: 'पासवर्ड की पुष्टि करें',
        confirmPasswordPlaceholder: 'पासवर्ड फिर से दर्ज करें',
        createAccount: 'खाता बनाएं',
        passwordRequirements: 'पासवर्ड आवश्यकताएं',
        requirement1: 'कम से कम 6 अक्षर लंबा',
        requirement2: 'कम से कम एक संख्या होनी चाहिए',
        requirement3: 'कम से कम एक विशेष वर्ण होना चाहिए',
        Set_up_your_account_credentials : 'अपने खाते के क्रेडेंशियल सेट करें',
        Back_to_OTP_Verification: 'ओटीपी सत्यापन पर वापस जाएँ'
      },
      step4: {
        success: 'खाता सफलतापूर्वक बनाया गया!',
        welcome: 'में आपका स्वागत है',
        companyName: 'MAMFDC शिक्षा ऋण पोर्टल',
        signIn: 'अपने खाते में साइन इन करें',
        description: 'हमारे साथ अपनी शिक्षा ऋण आवेदन यात्रा शुरू करें',
        Registration_Successful :'पंजीकरण सफल हुआ',
        You_can_now_login_with_your_credentials_to_access_your_account_and_apply_for_education_loans :'आप अब अपने क्रेडेंशियल का उपयोग करके लॉगिन कर सकते हैं, अपने खाते तक पहुँच सकते हैं और शिक्षा ऋण के लिए आवेदन कर सकते हैं।'
      },
      errors: {
        nameRequired: 'नाम आवश्यक है',
        nameMinLength: 'नाम कम से कम 3 अक्षर का होना चाहिए',
        mobileRequired: 'मोबाइल नंबर आवश्यक है',
        mobileDigits: 'मोबाइल नंबर में केवल अंक होने चाहिए',
        mobileStart: 'मोबाइल नंबर 6, 7, 8, या 9 से शुरू होना चाहिए',
        mobileLength: 'मोबाइल नंबर बिल्कुल 10 अंकों का होना चाहिए',
        otpRequired: 'OTP आवश्यक है',
        otpLength: 'OTP बिल्कुल 6 अंकों का होना चाहिए',
        otpDigits: 'OTP में केवल अंक होने चाहिए',
        passwordRequired: 'पासवर्ड आवश्यक है',
        passwordMinLength: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
        passwordSpecial: 'पासवर्ड में कम से कम एक विशेष वर्ण होना चाहिए',
        passwordNumber: 'पासवर्ड में कम से कम एक संख्या होनी चाहिए',
        confirmPasswordRequired: 'कृपया अपने पासवर्ड की पुष्टि करें',
        confirmPasswordMinLength: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
        confirmPasswordMatch: 'पासवर्ड मेल नहीं खाते',
        usernameRequired: 'उपयोगकर्ता नाम आवश्यक है'
      }
    },
    mr: {
      // Login translations
      login: {
        title: 'तुमच्या खात्यात साइन इन करा',
        subtitle: 'तुमच्या खात्यात प्रवेश करण्यासाठी तुमची प्रमाणपत्रे प्रविष्ट करा',
        username: 'वापरकर्तानाव / मोबाईल नंबर',
        usernamePlaceholder: 'वापरकर्तानाव किंवा मोबाईल नंबर प्रविष्ट करा',
        password: 'पासवर्ड',
        passwordPlaceholder: 'तुमचा पासवर्ड प्रविष्ट करा',
        rememberMe: 'मला लक्षात ठेवा',
        forgotPassword: 'पासवर्ड विसरलात?',
        signIn: 'साइन इन करा',
        noAccount: 'खाते नाही?',
        registerNow: 'आता नोंदणी करा',
        secureLogin: 'सुरक्षित लॉगिन',
        loginSecure: 'तुमचे लॉगिन सुरक्षित आहे',
        protectedBy: 'महाराष्ट्र शासनाच्या सुरक्षा मानकांद्वारे संरक्षित',
        welcomeBack: 'परत स्वागत आहे!',
        accessAccount: 'तुमच्या शिक्षण कर्ज अर्जांचे व्यवस्थापन करण्यासाठी आणि तुमची प्रगती ट्रॅक करण्यासाठी तुमच्या खात्यात प्रवेश करा।',
       
      },
      step1: {
        title: 'तुमचे खाते तयार करा',
        fullName: 'पूर्ण नाव',
        fullNamePlaceholder: 'तुमचे पूर्ण नाव प्रविष्ट करा',
        mobile: 'मोबाईल नंबर',
        mobilePlaceholder: '10 अंकी मोबाईल नंबर प्रविष्ट करा',
        sendCode: 'सत्यापन कोड पाठवा',
        alreadyAccount: 'आधीच खाते आहे?',
        login: 'लॉगिन करा',
        Government_Initiative: 'सरकारी उपक्रम',
        Register_to_apply_for_an_education_loan : 'शिक्षण कर्जासाठी अर्ज करण्यासाठी नोंदणी करा',
        Your_data_is_protected_by_Government_of_Maharashtra_security_standards : 'तुमचा डेटा महाराष्ट्र शासनाच्या सुरक्षा मानकांनुसार सुरक्षित आहे',
        We_never_share_your_personal_information_with_third_parties : 'आम्ही तुमची वैयक्तिक माहिती कधीही तृतीय पक्षासोबत सामायिक करत नाही',
        Education_Loan_for_Minority_Communities : 'अल्पसंख्याक समुदायांसाठी शिक्षण कर्ज',
        Register_now_to_apply_for_education_loans:'अनुदानित व्याजदरांवर ₹5,00,000 पर्यंतच्या शिक्षण कर्जासाठी आत्ताच नोंदणी करा',
        Mobile_No_and_Name :'मोबाईल क्रमांक आणि नाव',
        OTP_Verification :'ओटीपी पडताळणी',
        Create_Account : 'खाते तयार करा',
        Completed :'पूर्ण झाले'
      },
      step2: {
        title: 'तुमचा मोबाईल सत्यापित करा',
        otpSent: 'पाठवलेला 6 अंकी OTP प्रविष्ट करा',
        enterOtp: 'OTP प्रविष्ट करा',
        otpPlaceholder: '6 अंकी OTP प्रविष्ट करा',
        verifyOtp: 'OTP सत्यापित करा',
        didntReceive: 'कोड मिळाला नाही?',
        resendOtp: 'OTP पुन्हा पाठवा',
        resendIn: 'मध्ये पुन्हा पाठवा',
        otpValid: 'OTP 10 मिनिटांसाठी वैध आहे',
        otpExpire: 'कृपया कालबाह्य होण्यापूर्वी कोड प्रविष्ट करा',
        Secure_Verification : 'सुरक्षित पडताळणी',
        Back_to_Registration : 'नोंदणीवर परत जा',
        Secure_Account : 'तुमच्या खात्याची माहिती सेट करा'
      },
      step3: {
        title: 'खाते तयार करा',
        username: 'वापरकर्तानाव (मोबाईल नंबर)',
        password: 'पासवर्ड तयार करा',
        passwordPlaceholder: 'पासवर्ड प्रविष्ट करा',
        confirmPassword: 'पासवर्डची पुष्टी करा',
        confirmPasswordPlaceholder: 'पासवर्ड पुन्हा प्रविष्ट करा',
        createAccount: 'खाते तयार करा',
        passwordRequirements: 'पासवर्ड आवश्यकता',
        requirement1: 'किमान 6 अक्षरे लांब',
        requirement2: 'किमान एक संख्या असावी',
        requirement3: 'किमान एक विशेष वर्ण असावा',
        Set_up_your_account_credentials : 'तुमच्या खात्याची माहिती सेट करा',
        Back_to_OTP_Verification: 'ओटीपी पडताळणीवर परत जा'
      },
      step4: {
        success: 'खाते यशस्वीरित्या तयार केले!',
        welcome: 'मध्ये आपले स्वागत आहे',
        companyName: 'MAMFDC शिक्षण कर्ज पोर्टल',
        signIn: 'तुमच्या खात्यात साइन इन करा',
        description: 'आमच्यासोबत तुमचा शिक्षण कर्ज अर्ज प्रवास सुरू करा',
        Registration_Successful :'नोंदणी यशस्वी झाली',
        You_can_now_login_with_your_credentials_to_access_your_account_and_apply_for_education_loans :'तुम्ही आता तुमच्या खात्याची माहिती वापरून लॉगिन करू शकता, तुमच्या खात्यात प्रवेश मिळवू शकता आणि शिक्षण कर्जासाठी अर्ज करू शकता.'

      },
      errors: {
        nameRequired: 'नाव आवश्यक आहे',
        nameMinLength: 'नाव किमान 3 अक्षरांचे असावे',
        mobileRequired: 'मोबाईल नंबर आवश्यक आहे',
        mobileDigits: 'मोबाईल नंबरमध्ये फक्त अंक असावेत',
        mobileStart: 'मोबाईल नंबर 6, 7, 8, किंवा 9 ने सुरू व्हावा',
        mobileLength: 'मोबाईल नंबर अचूक 10 अंकांचा असावा',
        otpRequired: 'OTP आवश्यक आहे',
        otpLength: 'OTP अचूक 6 अंकांचा असावा',
        otpDigits: 'OTP मध्ये फक्त अंक असावेत',
        passwordRequired: 'पासवर्ड आवश्यक आहे',
        passwordMinLength: 'पासवर्ड किमान 6 अक्षरांचा असावा',
        passwordSpecial: 'पासवर्डमध्ये किमान एक विशेष वर्ण असावा',
        passwordNumber: 'पासवर्डमध्ये किमान एक संख्या असावी',
        confirmPasswordRequired: 'कृपया तुमच्या पासवर्डची पुष्टी करा',
        confirmPasswordMinLength: 'पासवर्ड किमान 6 अक्षरांचा असावा',
        confirmPasswordMatch: 'पासवर्ड जुळत नाहीत',
        usernameRequired: 'वापरकर्तानाव आवश्यक आहे'
      }
    }
  },

  t(lang, key) {
    const keys = key.split('.');
    let value = this.translations[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }
};

export function setLanguage(lang) {
  currentLanguage.set(lang);
}