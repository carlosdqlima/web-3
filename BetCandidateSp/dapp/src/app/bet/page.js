"use client"

import Head from "next/head";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { claimPrize, getDispute, placeBet } from "@/services/Web3Service";
import Web3 from "web3";

export default function Bet() {

    const { push } = useRouter();

    const [message, setMessage] = useState();
    const [dispute, setDispute] = useState({
        candidate1: "Loading...",
        candidate2: "Loading...",
        candidate3: "Loading...",
        image1: "https://bit.ly/4ePysay",
        image2: "https://bit.ly/47WGxrq",
        image3: "https://bit.ly/47WGJa8",
        total1: 0,
        total2: 0,
        total3: 0,
        winner: 0
    });

    useEffect(() => {
        if (!localStorage.getItem("wallet")) return push("/");
        setMessage("Obtaining dispute data...stand by...");
        getDispute()
            .then(dispute => {
                setDispute(dispute);
                setMessage("");
            })
            .catch(err => {
                console.error(err);
                setMessage(err.message);
            })
    }, []);

    function processBet(candidate) {
        setMessage("Connecting to wallet... wait...");
        const amount = prompt("Amount in POL to bet:", "1");
        placeBet(candidate, amount)
            .then(() => {
                alert("Bet successfully received. It may take 1 minute for it to appear in the system.");
                setMessage("");
            })
            .catch(err => {
                console.error(err.data ? err.data : err);
                setMessage(err.data ? err.data.message : err.message);
            })
    }

    function btnClaimClick() {
        setMessage("Connecting to wallet... wait...");
        claimPrize()
            .then(() => {
                alert("Prize successfully collected. It may take 1 minute for it to appear in your wallet.");
                setMessage("");
            })
            .catch(err => {
                console.error(err.data ? err.data : err);
                setMessage(err.data ? err.data.message : err.message);
            })
    }

    return (
        <>
            <Head>
                <title>BetCandidateSP | Bet</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className="container px-4 py-5">
                <div className="row align-items-center">
                    <h1 className="display-5 fw-bold text-body-emphasis lh-1 mb-3">BetCandidateSP</h1>
                    <p className="lead">On-chain betting in São Paulo municipal elections.</p>
                    {
                        dispute.winner == 0
                            ? <p className="lead">You have until election day to place your bet on one of the candidates below.</p>
                            : <p className="lead">Dispute closed. See the winner below and claim your prize.</p>
                    }
                </div>
                <div className="row flex-lg-row-reverse align-items-center g-1 py-5">
                    <div className="col"></div>

                    {
                        dispute.winner == 0 || dispute.winner == 1
                            ? <div className="col">
                                <h3 className="my-2 d-block mx-auto" style={{ width: 250 }}>
                                    {dispute.candidate1}
                                </h3>
                                <img src={dispute.image1} className="d-block mx-auto img-fluid rounded" width={250} />
                                {
                                    dispute.winner == 1
                                        ? <button className="btn btn-primary p-3 my-2 d-block mx-auto" style={{ width: 250 }} onClick={btnClaimClick}>Pick up my prize</button>
                                        : <button className="btn btn-primary p-3 my-2 d-block mx-auto" style={{ width: 250 }} onClick={() => processBet(1)}>I bet on this candidate</button>
                                }
                                <span className="badge text-bg-secondary d-block mx-auto" style={{ width: 250 }}>{Web3.utils.fromWei(dispute.total1, "ether")} POL Bets</span>
                            </div>
                            : <></>
                    }

                    {
                        dispute.winner == 0 || dispute.winner == 2
                            ? <div className="col">
                                <h3 className="my-2 d-block mx-auto" style={{ width: 250 }}>
                                    {dispute.candidate2}
                                </h3>
                                <img src={dispute.image2} className="d-block mx-auto img-fluid rounded" width={250} />
                                {
                                    dispute.winner == 2
                                        ? <button className="btn btn-primary p-3 my-2 d-block mx-auto" style={{ width: 250 }} onClick={btnClaimClick}>Pick up my prize</button>
                                        : <button className="btn btn-primary p-3 my-2 d-block mx-auto" style={{ width: 250 }} onClick={() => processBet(2)}>I bet on this candidate</button>
                                }
                                <span className="badge text-bg-secondary d-block mx-auto" style={{ width: 250 }}>{Web3.utils.fromWei(dispute.total2, "ether")} POL Bets</span>
                            </div>
                            : <></>
                    }

                    {
                        dispute.winner == 0 || dispute.winner == 3
                            ? <div className="col">
                                <h3 className="my-2 d-block mx-auto" style={{ width: 250 }}>
                                    {dispute.candidate3}
                                </h3>
                                <img src={dispute.image3} className="d-block mx-auto img-fluid rounded" width={250} />
                                {
                                    dispute.winner == 3
                                        ? <button className="btn btn-primary p-3 my-2 d-block mx-auto" style={{ width: 250 }} onClick={btnClaimClick}>Pick up my prize</button>
                                        : <button className="btn btn-primary p-3 my-2 d-block mx-auto" style={{ width: 250 }} onClick={() => processBet(3)}>I bet on this candidate</button>
                                }
                                <span className="badge text-bg-secondary d-block mx-auto" style={{ width: 250 }}>{Web3.utils.fromWei(dispute.total3, "ether")} POL Bets</span>
                            </div>
                            : <></>
                    }

                </div>
                <div className="row align-items-center">
                    <p className="message">{message}</p>
                </div>
                <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
                    <p className="col-4 mb-0 text-body-secondary">
                        &copy; 2024 - BetCandidateSP
                    </p>
                    <ul className="nav col-4 justify-content-end">
                        <li className="nav-item"><a href="/" className="nav-link px-2 text-body-secondary">Home</a></li>
                        <li className="nav-item"><a href="/about" className="nav-link px-2 text-body-secondary">About</a></li>
                    </ul>
                </footer>
            </div>
        </>
    );
}
