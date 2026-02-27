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

//Exiting Appliction
export async function getUserApplication(userId) {
  const response = await fetch(`/api/createApplication/${userId}?action=getUserApplication`);
  return response.json();
}

//Start Page__

//put the start page data 
const customSaveApplicationStart = async ({ userId, applicationId, stepData }) => {
    
    console.log("customSaveApplicationStart - userId:", userId, "applicationId:", applicationId);

    try {
        const response = await fetch(`/api/createApplication/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saveApplicationStart',
                userId,
                applicationId, 
                stepData
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Save application start response:", result);
        return result;

    } catch (e) {
        console.error("customSaveApplicationStart failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to save application start data'
        };
    }
};

//get start page data 
const getApplicationData = async (applicationId) => {
    console.log("getApplicationData called for applicationId:", applicationId);

    try {
        const response = await fetch(`/api/createApplication/${applicationId}?action=getApplicationData`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Get application data response:", result);
        return result;

    } catch (e) {
        console.error("getApplicationData failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to get application data'
        };
    }
};

//personal detail page__ 

//get the personal detail page data
const getPersonalDetailsData = async (applicationId) => {
    console.log("getPersonalDetailsData called for applicationId:", applicationId);

    try {
        const response = await fetch(`/api/createApplication/${applicationId}?action=getPersonalDetails`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Get personal details response:", result);
        return result;

    } catch (e) {
        console.error("getPersonalDetailsData failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to get personal details'
        };
    }
};

//put the personal detail page data 
const customSavePersonalDetails = async ({ applicationId, personalDetails }) => {
    console.log("customSavePersonalDetails called for applicationId:", applicationId);

    try {
        const response = await fetch(`/api/createApplication/${applicationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'savePersonalDetails',
                applicationId,
                personalDetails
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Save personal details response:", result);
        return result;

    } catch (e) {
        console.error("customSavePersonalDetails failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to save personal details'
        };
    }
};

//Education detail page ___

// Get education details
const getEducationDetailsData = async (applicationId) => {
    console.log("getEducationDetailsData called for applicationId:", applicationId);

    try {
        const response = await fetch(`/api/createApplication/${applicationId}?action=getEducationDetails`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Get education details response:", result);
        return result;

    } catch (e) {
        console.error("getEducationDetailsData failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to get education details'
        };
    }
};

// Save education details
const customSaveEducationDetails = async ({ applicationId, educationDetails }) => {
    console.log("customSaveEducationDetails called for applicationId:", applicationId);

    try {
        const response = await fetch(`/api/createApplication/${applicationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saveEducationDetails',
                applicationId,
                educationDetails
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Save education details response:", result);
        return result;

    } catch (e) {
        console.error("customSaveEducationDetails failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to save education details'
        };
    }
};




//Guarantor detail 

// Get guarantor details
const getGuarantorDetailsData = async (applicationId) => {
    console.log("getGuarantorDetailsData called for applicationId:", applicationId);

    try {
        const response = await fetch(`/api/guarantorDetails/${applicationId}?action=getGuarantorDetails`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Get guarantor details response:", result);
        return result;

    } catch (e) {
        console.error("getGuarantorDetailsData failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to get guarantor details'
        };
    }
};

// Save guarantor details
const customSaveGuarantorDetails = async ({ applicationId, guarantorDetails }) => {
    console.log("customSaveGuarantorDetails called for applicationId:", applicationId);

    try {
        const response = await fetch(`/api/guarantorDetails/${applicationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saveGuarantorDetails',
                applicationId,
                guarantorDetails
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Save guarantor details response:", result);
        return result;

    } catch (e) {
        console.error("customSaveGuarantorDetails failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to save guarantor details'
        };
    }
};


//Collateral Properties --------------------

// Get collateral properties

const getCollateralProperties = async (userId, applicationId) => {
    console.log("getCollateralProperties called for:", { userId, applicationId });

    try {
        const response = await fetch(
            `/api/collateral/${userId}/${applicationId}?action=getCollateralProperties`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Get collateral properties response:", result);
        return result;

    } catch (e) {
        console.error("getCollateralProperties failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to get collateral properties'
        };
    }
};

const customSaveCollateralProperties = async (userId, applicationId, properties) => {
    console.log("customSaveCollateralProperties called:", { userId, applicationId, count: properties.length });

    try {
        const response = await fetch(`/api/collateral/${userId}/${applicationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saveCollateralProperties',
                properties
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Save collateral properties response:", result);
        return result;

    } catch (e) {
        console.error("customSaveCollateralProperties failed:", e);
        return {
            error: -2,
            errorMsg: e.message || 'Failed to save collateral properties'
        };
    }
};

// Get FD collaterals

const getFDCollaterals = async (userId, applicationId) => {
    console.log("getFDCollaterals called for:", { userId, applicationId });
    try {
        const response = await fetch(
            `/api/collateral/${userId}/${applicationId}?action=getFDCollaterals`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        console.log("Get FD collaterals response:", result);
        return result;
    } catch (e) {
        console.error("getFDCollaterals failed:", e);
        return { error: -2, errorMsg: e.message || 'Failed to get FD collaterals' };
    }
};

// Save FD collaterals
const saveFDCollaterals = async (userId, applicationId, fdCollaterals) => {
    console.log("saveFDCollaterals called:", { userId, applicationId, count: fdCollaterals.length });
    try {
        const response = await fetch(`/api/collateral/${userId}/${applicationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saveFDCollaterals',
                fdCollaterals
            })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        console.log("Save FD collaterals response:", result);
        return result;
    } catch (e) {
        console.error("saveFDCollaterals failed:", e);
        return { error: -2, errorMsg: e.message || 'Failed to save FD collaterals' };
    }
};


// Get LIC collaterals
const getLICCollaterals = async (userId, applicationId) => {
    console.log("getLICCollaterals called for:", { userId, applicationId });
    try {
        const response = await fetch(
            `/api/collateral/${userId}/${applicationId}?action=getLICCollaterals`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        console.log("Get LIC collaterals response:", result);
        return result;
    } catch (e) {
        console.error("getLICCollaterals failed:", e);
        return { error: -2, errorMsg: e.message || 'Failed to get LIC collaterals' };
    }
};

// Save LIC collaterals
const saveLICCollaterals = async (userId, applicationId, licCollaterals) => {
    console.log("saveLICCollaterals called:", { userId, applicationId, count: licCollaterals.length });
    try {
        const response = await fetch(`/api/collateral/${userId}/${applicationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saveLICCollaterals',
                licCollaterals
            })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        console.log("Save LIC collaterals response:", result);
        return result;
    } catch (e) {
        console.error("saveLICCollaterals failed:", e);
        return { error: -2, errorMsg: e.message || 'Failed to save LIC collaterals' };
    }
};


// Get Govt collaterals
const getGovtCollaterals = async (userId, applicationId) => {
    console.log("getGovtCollaterals called for:", { userId, applicationId });
    try {
        const response = await fetch(
            `/api/collateral/${userId}/${applicationId}?action=getGovtCollaterals`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        console.log("Get govt collaterals response:", result);
        return result;
    } catch (e) {
        console.error("getGovtCollaterals failed:", e);
        return { error: -2, errorMsg: e.message || 'Failed to get govt collaterals' };
    }
};

// Save Govt collaterals
const saveGovtCollaterals = async (userId, applicationId, govtCollaterals) => {
    console.log("saveGovtCollaterals called:", { userId, applicationId, count: govtCollaterals.length });
    try {
        const response = await fetch(`/api/collateral/${userId}/${applicationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saveGovtCollaterals',
                govtCollaterals
            })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        console.log("Save govt collaterals response:", result);
        return result;
    } catch (e) {
        console.error("saveGovtCollaterals failed:", e);
        return { error: -2, errorMsg: e.message || 'Failed to save govt collaterals' };
    }
};



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
  getVerifiedContacts,
  customSaveApplicationStart,
  getApplicationData,
  getPersonalDetailsData,
  customSavePersonalDetails,
  getEducationDetailsData,
  customSaveEducationDetails,
  getGuarantorDetailsData,
  customSaveGuarantorDetails,


  getCollateralProperties,
  customSaveCollateralProperties,
  getFDCollaterals, 
  saveFDCollaterals,
  getLICCollaterals, 
  saveLICCollaterals,
  getGovtCollaterals, 
  saveGovtCollaterals
};