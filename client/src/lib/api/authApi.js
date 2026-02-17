//REGISTRATION FLOW 

const customVerifyApplicantAndSendOtp = async ({ mobile, name }) => {
    console.log("customVerifyApplicantAndSendOtp called with mobile:", mobile);
    
    try {
        // Check if user already exists
        const checkResponse = await fetch(`/api/auth?action=checkUser&mobile=${mobile}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const checkData = await checkResponse.json();
        
        // If user exists, return error and DON'T send OTP
        if (checkData.error === 0) {
            return {
                error: -1,
                errorMsg: `User with mobile number ${mobile} already registered. Please login.`,
            };
        }

        // User doesn't exist, send OTP
        const params = { mobileNumber: mobile, name };
        const otpResponse = await fetch('/api/sendOTP', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!otpResponse.ok) {
            const { error, errorMsg } = await otpResponse.json();
            return { error, errorMsg };
        }

        const { error, errorMsg, uid: mobileVerificationId } = await otpResponse.json();
        console.log("OTP sent. UID:", mobileVerificationId);
        
        return { error, errorMsg, mobileVerificationId };
        
    } catch (e) {
        console.error("customVerifyApplicantAndSendOtp failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

const customVerifyOtp = async ({ uid, otp,dataName }) => {
    console.log("customVerifyOtp called with UID:", uid);
    
    try {
        const response = await fetch('/api/verifyOTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid, otp,dataName}),
        });

        const data = await response.json();
        
        if (data.error && data.error !== 0) {
            return { error: data.error, errorMsg: data.errorMsg };
        }

        console.log('OTP verified successfully');
        return { error: 0, errorMsg: "", mobile: data.mobile };
        
    } catch (e) {
        console.error("customVerifyOtp failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

const customVerifyApplicant = async ({ mobile, name, password, mobileConfirmationCode }) => {
    console.log("customVerifyApplicant called with mobile:", mobile);
    
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile,
                name,
                password,
                otp: mobileConfirmationCode,
                action: 'register'
            }),
        });

        const data = await response.json();
        
        if (data.error && data.error !== 0) {
            return { error: data.error, errorMsg: data.errorMsg };
        }

        console.log('User registered successfully');
        return { error: 0, errorMsg: "", mobileConfirmationCode: "" };
        
    } catch (e) {
        console.error("customVerifyApplicant failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

const customSendOtp = async ({ mobileNumber, name, id }) => {
    console.log("customSendOtp called with mobile:", mobileNumber);
    
    try {
        const params = { mobileNumber, name, id };
        const response = await fetch('/api/sendOTP', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const { error, errorMsg } = await response.json();
            return { error, errorMsg };
        }

        const { error, errorMsg, uid } = await response.json();
        console.log("OTP sent. UID:", uid);
        
        return { error, errorMsg, uid };
        
    } catch (e) {
        console.error("customSendOtp failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

//EMAIL OTP 

const customSendEmailOtp = async ({ email, name, id }) => {
    console.log("customSendEmailOtp called with email:", email);
    
    try {
        const params = { email, name, id };
        const response = await fetch('/api/sendEmailOTP', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const { error, errorMsg } = await response.json();
            return { error, errorMsg };
        }

        const { error, errorMsg, uid } = await response.json();
        console.log("Email OTP sent. UID:", uid);
        
        return { error, errorMsg, uid };
        
    } catch (e) {
        console.error("customSendEmailOtp failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

const customVerifyEmailOtp = async ({ uid, otp, dataName }) => {
    console.log("customVerifyEmailOtp called with UID:", uid);
    
    try {
        const response = await fetch('/api/verifyEmailOTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid, otp, dataName }),
        });

        const data = await response.json();
        
        if (data.error && data.error !== 0) {
            return { error: data.error, errorMsg: data.errorMsg };
        }

        console.log('Email OTP verified successfully');
        return { error: 0, errorMsg: "", email: data.email };
        
    } catch (e) {
        console.error("customVerifyEmailOtp failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

//LOGIN 

const customLoginApplicant = async ({ mobile, password }) => {
    console.log("customLoginApplicant called with mobile:", mobile);
    
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                mobile, 
                password,
                action: 'login'
            }),
        });

        const data = await response.json();
        
        if (data.error && data.error !== 0) {
            return { error: data.error, errorMsg: data.errorMsg };
        }

        console.log('Login successful');
        return {
            error: 0,
            errorMsg: "",
            user: data.user,
            token: data.access_token,
            refreshToken: data.refresh_token,
        };
        
    } catch (e) {
        console.error("customLoginApplicant failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

//PASSWORD MANAGEMENT

const customGetUserId = async ({ mobile }) => {
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                mobile,
                action: 'getUserByMobile'
            }),
        });

        const data = await response.json();
        
        if (data.error && data.error !== 0) {
            return { error: data.error, errorMsg: data.errorMsg };
        }

        return {
            error: 0,
            errorMsg: "",
            userId: data.userId,
            name: data.name,
        };
        
    } catch (e) {
        console.error("customGetUserId failed:", e);
        return { error: -2, errorMsg: e.message };
    }
};

const customChangePassword = async ({ mobile, password, userId }) => {
    console.log("customChangePassword called for mobile:", mobile);
    
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                mobile, 
                password, 
                userId,
                action: 'changePassword'
            }),
        });

        const data = await response.json();
        
        if (data.error && data.error !== 0) {
            return { error: data.error, errorMsg: data.errorMsg };
        }

        return { error: 0, errorMsg: "" };
        
    } catch (e) {
        console.error("customChangePassword failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

const customSendPasswordResetOtp = async ({ mobile, name }) => {
    console.log("customSendPasswordResetOtp called with mobile:", mobile);
    
    try {
        // First check if user exists
        const userCheck = await customGetUserId({ mobile });
        
        if (userCheck.error !== 0) {
            return {
                error: -1,
                errorMsg: "User with this mobile number not found"
            };
        }

        // Send OTP
        const params = { mobileNumber: mobile, name: name || userCheck.name };
        const response = await fetch('/api/sendOTP', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const { error, errorMsg } = await response.json();
            return { error, errorMsg };
        }

        const { error, errorMsg, uid: mobileVerificationId } = await response.json();
        return { error, errorMsg, mobileVerificationId };
        
    } catch (e) {
        console.error("customSendPasswordResetOtp failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

// Application Management
const customCreateApplication = async ({ userId }) => {
    console.log("customCreateApplication called for userId:", userId);
    
    try {
        const response = await fetch('/api/createApplication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        const data = await response.json();
        
        if (data.error && data.error !== 0) {
            return { error: data.error, errorMsg: data.errorMsg };
        }

        console.log('Application created. ID:', data.applicationId);
        return {
            error: 0,
            errorMsg: "",
            applicationId: data.applicationId
        };
        
    } catch (e) {
        console.error("customCreateApplication failed:", e);
        return { error: -1, errorMsg: e.message };
    }
};

async function getVerifiedContacts(applicationId) {
  try {
    const response = await fetch(
      `/api/getVerifiedContacts?applicationId=${applicationId}`,
      {
        method: 'GET'
      }
    );

    const result = await response.json();

    if (result.error === 0) {
      return {
        success: true,
        mobileVerified: !!result.mobile,
        emailVerified: !!result.email,
        mobile: result.mobile,
        email: result.email
      };
    } else {
      return {
        success: false,
        mobileVerified: false,
        emailVerified: false,
        mobile: null,
        email: null
      };
    }

  } catch (error) {
    console.error('Error fetching verified contacts:', error);

    return {
      success: false,
      mobileVerified: false,
      emailVerified: false,
      mobile: null,
      email: null
    };
  }
}


export {
  customVerifyApplicantAndSendOtp,
  customVerifyOtp,
  customVerifyApplicant,
  customSendOtp,
  customSendEmailOtp,
  customVerifyEmailOtp,
  customLoginApplicant,
  customGetUserId,
  customChangePassword,
  customSendPasswordResetOtp,
  customCreateApplication,
  getVerifiedContacts
};