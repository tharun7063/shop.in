import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import useStore from "../store/useStore";
import { useNavigate } from "react-router-dom";



// Get device info for web
function getWebDeviceDetails() {
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem("device_id", deviceId);
    }

    const ua = navigator.userAgent;
    let deviceType = "DESKTOP";
    if (/Tablet|iPad/i.test(ua)) deviceType = "TABLET";
    else if (/Mobi|Android/i.test(ua)) deviceType = "MOBILE";

    return { deviceId, deviceType };
}

export default function LoginPage() {
    const navigate = useNavigate();
    const backend_url = useStore((state) => state.backend_url);
    const setAuth = useStore((state) => state.setAuth);
    const { user } = useStore();

    const [isLogin, setIsLogin] = useState(true);
    const [authType, setAuthType] = useState("email");
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState("");
    const otpInputRef = useRef(null);

    const [otpTimer, setOtpTimer] = useState(0);
    const [canResendOtp, setCanResendOtp] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
    if (user) {
      navigate("/account");
    }
  }, [user, navigate]);

       // Reset messages
    const resetMessages = () => {
        setError(null);
        setMessage(null);
    };

    // Auto-clear error after 4s
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Auto-focus OTP input
    useEffect(() => {
        if (showOtpInput && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [showOtpInput]);

    // OTP countdown
    useEffect(() => {
        if (otpTimer <= 0) {
            setCanResendOtp(true);
            return;
        }
        setCanResendOtp(false);
        const interval = setInterval(() => {
            setOtpTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResendOtp(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [otpTimer]);

    // Start OTP countdown
    const startOtpCountdown = (duration) => {
        setOtpTimer(duration);
        setCanResendOtp(false);
    };

    // Login / Signup
    async function handleSubmit(e) {
        e.preventDefault();
        resetMessages();
        setLoading(true);
        const { deviceId, deviceType } = getWebDeviceDetails();
        // Determine action based on login/signup
        const action = isLogin ? "sign_in" : "sign_up";
        let payload = {
            action,
            auth_type: authType,
            password,
            device_id: deviceId,
            device_type: deviceType,
        };
        if (authType === "email") payload.email = email;
        else {
            payload.country_code = countryCode;
            payload.phone_number = phoneNumber;
        }
        try {
            console.log("Submitting payload:", payload);
            const res = await fetch(`${backend_url}/auth/authenticate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            console.log("Response data:", data);
            if (!res.ok) {
                throw new Error(data.error || "Signup/Login failed");
            }
            if (action === "sign_in") {
                // Login flow
                console.log("🔹 Sign-in Response:", data);
                if (data.success && data.user && data.jwt_token && data.refresh_token) {
                    setAuth(data.user, data.jwt_token);
                    localStorage.setItem("refresh_token", data.refresh_token);
                    // Save user details (optional)
                    localStorage.setItem("user", JSON.stringify(data.user));
                    console.log("✅ Login successful!");
                    console.log("🔹 User Info:", data.user);
                    console.log("🔹 JWT Token:", data.jwt_token);
                    console.log("🔹 Refresh Token:", data.refresh_token);
                    // Redirect after success
                    navigate("/", { replace: true });
                } else {
                    console.error("❌ Login failed:", data.message || "Invalid credentials");
                    setError(data.message || "Invalid credentials");
                }
            } else {
                // Signup flow
                if (data.success && data.user && data.jwt_token && data.refresh_token) {
                    // Some backends might directly return token on signup
                    localStorage.setItem("auth_token", data.refresh_token);
                    navigate("/", { replace: true });
                } else if (data.user && data.user.auth_type === "otp") {
                    setShowOtpInput(true);
                    setMessage("OTP sent! Please enter the OTP to verify.");
                    startOtpCountdown(data.otp_expires_in || 180);
                } else {
                    setError(data.message || "Signup failed");
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    
    // Verify OTP
    async function handleOtpVerify(e) {
        e.preventDefault();
        resetMessages();
        setVerifying(true);
        const { deviceId, deviceType } = getWebDeviceDetails();
        const payload = {
            auth_type: authType,
            otp,
            device_id: deviceId,
            device_type: deviceType,
            ...(authType === "email"
                ? { email }
                : { country_code: countryCode, phone_number: phoneNumber }),
        };
        console.log("🔹 OTP Verify Payload:", payload);
        try {
            const res = await fetch(`${backend_url}/auth/authenticate-pass`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            console.log("🔹 Raw Response:", res);
            const data = await res.json();
            console.log("🔹 Parsed Response Data:", data);
            if (!res.ok) {
                console.error("❌ OTP Verify Failed:", data.error || "OTP verification failed");
                throw new Error(data.error || "OTP verification failed");
            }
            if (data.success && data.user && data.jwt_token) {
                setAuth(data.user, data.jwt_token);
                localStorage.setItem("refresh_token", data.refresh_token);
                navigate("/", { replace: true });
            }
        } catch (err) {
            console.error("🚨 OTP Verify Error:", err);
            setError(err.message);
        } finally {
            console.log("🔹 OTP Verify process finished.");
            setVerifying(false);
        }
    }

    // Resend OTP
    async function handleResendOtp() {
        resetMessages();
        setResending(true);
        const { deviceId, deviceType } = getWebDeviceDetails();
        let payload = { auth_type: authType };
        if (authType === "email") {
            payload.email = email;
        } else {
            payload.countryCode = countryCode;
            payload.mobile = phoneNumber;
        }
        try {
            const res = await fetch(`${backend_url}/auth/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Resend OTP failed");
            setMessage("OTP resent! Please check your email/phone.");
            startOtpCountdown(data.otp_expires_in || 180);
        } catch (err) {
            setError(err.message);
        } finally {
            setResending(false);
        }
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white">
                <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? "Login" : "Sign Up"}</h2>

                {/* Auth type switch */}
                <div className="flex justify-center gap-6 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="authType"
                            value="email"
                            checked={authType === "email"}
                            onChange={() => setAuthType("email")}
                        />
                        Email
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="authType"
                            value="mobile"
                            checked={authType === "mobile"}
                            onChange={() => setAuthType("mobile")}
                        />
                        Mobile
                    </label>
                </div>

                {!showOtpInput ? (
                    // Login / Signup form
                    <form onSubmit={handleSubmit}>
                        {authType === "email" ? (
                            <div className="relative mb-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="peer w-full p-2 border rounded mt-1"
                                    required
                                />
                                <label className="block text-sm font-medium">Email</label>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium">Country Code</label>
                                    <input
                                        type="text"
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                        placeholder="+1"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full p-2 border rounded mt-1"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Password</label>
                            <div className="relative mb-4">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder=" "
                                    className="peer w-full p-2 border rounded mt-1 pr-10"
                                    required
                                />
                                <label className="block text-sm font-medium">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-600 mb-4">{error}</p>}
                        {message && <p className="text-green-600 mb-4">{message}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
                        </button>
                    </form>
                ) : (
                    // OTP form
                    <form onSubmit={handleOtpVerify}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                ref={otpInputRef}
                                className="w-full p-2 border rounded mt-1"
                                required
                            />
                        </div>

                        {/* Countdown & Resend */}
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-600">
                                {otpTimer > 0
                                    ? `OTP expires in ${Math.floor(otpTimer / 60)
                                        .toString()
                                        .padStart(2, "0")}:${(otpTimer % 60)
                                            .toString()
                                            .padStart(2, "0")}`
                                    : "OTP expired"}
                            </p>
                            <button
                                type="button"
                                className={`text-blue-600 underline mt-2 ${canResendOtp ? "" : "opacity-50 cursor-not-allowed"}`}
                                onClick={handleResendOtp}
                                disabled={!canResendOtp || resending}
                            >
                                {resending ? "Resending OTP..." : "Resend OTP"}
                            </button>
                        </div>

                        {error && <p className="text-red-600 mb-4">{error}</p>}
                        {message && <p className="text-green-600 mb-4">{message}</p>}

                        <button
                            type="submit"
                            disabled={verifying}
                            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-green-300"
                        >
                            {verifying ? "Verifying..." : "Verify"}
                        </button>
                    </form>
                )}

                <p className="mt-4 text-center">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        className="text-blue-600 underline"
                        disabled={loading}
                        onClick={() => {
                            resetMessages();
                            setIsLogin(!isLogin);
                            setShowOtpInput(false);
                        }}
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        );
    }

}
