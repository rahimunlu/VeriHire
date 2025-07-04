"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';

export default function VerifyEmploymentPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [loading, setLoading] = useState(true);
    const [verificationData, setVerificationData] = useState<any>(null);
    const [error, setError] = useState("");
    const [worldIdLoggedIn, setWorldIdLoggedIn] = useState(false); // Placeholder for World ID login state
    const [submitStatus, setSubmitStatus] = useState("");
    const [worldIdProof, setWorldIdProof] = useState<any>(null);

    // World ID config
    const APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_staging_test";
    const ACTION = "trust-match-verification";

    useEffect(() => {
        if (!token) {
            setError("Missing verification token.");
            setLoading(false);
            return;
        }
        fetch(`/api/verification/verify-employment?token=${token}`)
            .then(async (res) => {
                if (!res.ok) throw new Error("Invalid or expired verification link.");
                const data = await res.json();
                setVerificationData(data.verificationData);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    const handleWorldIdSuccess = () => {
        // World ID verification completed
    };

    const handleWorldIdVerify = async (proof: ISuccessResult) => {
        setWorldIdProof(proof);
        setWorldIdLoggedIn(true);
    };

    const handleVerify = async (answer: "yes" | "no") => {
        if (!token || !worldIdProof) return;
        setSubmitStatus("Submitting...");
        const res = await fetch("/api/verification/verify-employment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token,
                answer,
                proof: worldIdProof.proof,
                merkle_root: worldIdProof.merkle_root,
                nullifier_hash: worldIdProof.nullifier_hash,
                verification_level: worldIdProof.verification_level,
            }),
        });
        const data = await res.json();
        if (res.ok) setSubmitStatus("Verification submitted. Thank you!");
        else setSubmitStatus(data.error || "Failed to submit verification.");
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!verificationData) return <div>No verification data found.</div>;

    return (
        <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
            <h2>Employment Verification</h2>
            <div style={{ marginBottom: 16 }}>
                <strong>Candidate:</strong> {verificationData.candidateName}<br />
                <strong>Email:</strong> {verificationData.candidateEmail}<br />
                <strong>Company:</strong> {verificationData.company}<br />
                <strong>Position:</strong> {verificationData.position}<br />
                {verificationData.startDate && <><strong>Start Date:</strong> {verificationData.startDate}<br /></>}
                {verificationData.endDate && <><strong>End Date:</strong> {verificationData.endDate}<br /></>}
            </div>
            {!worldIdLoggedIn ? (
                <IDKitWidget
                    app_id={APP_ID}
                    action={ACTION}
                    onSuccess={handleWorldIdSuccess}
                    handleVerify={handleWorldIdVerify}
                    verification_level={VerificationLevel.Device}
                >
                    {({ open }: { open: () => void }) => (
                        <button onClick={open} style={{ background: "#2563eb", color: "white", padding: "10px 20px", border: "none", borderRadius: 4 }}>
                            Login with World ID
                        </button>
                    )}
                </IDKitWidget>
            ) : (
                <>
                    <div style={{ margin: "16px 0" }}>
                        <button onClick={() => handleVerify("yes")} style={{ background: "#22c55e", color: "white", padding: "10px 20px", border: "none", borderRadius: 4, marginRight: 8 }}>
                            Yes, I verify employment
                        </button>
                        <button onClick={() => handleVerify("no")} style={{ background: "#ef4444", color: "white", padding: "10px 20px", border: "none", borderRadius: 4 }}>
                            No, I do not verify
                        </button>
                    </div>
                    {submitStatus && <div style={{ marginTop: 12 }}>{submitStatus}</div>}
                </>
            )}
        </div>
    );
} 