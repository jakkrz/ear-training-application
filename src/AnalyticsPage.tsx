import classes from "./AnalyticsPage.module.css";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContainer } from "./Collapsible";
import Chart from "chart.js/auto";
import { useEffect } from "react";

function StaffWarsChart() {
    useEffect(() => {
        const xValues = [
            "Mar 5",
            "Mar 6",
            "Mar 7",
            "Mar 8",
            "Mar 9",
            "Mar 10",
            "Mar 11",
            "Mar 12",
            "Mar 13",
            "Mar 14",
            "Mar 15",
            "Mar 16",
            "Mar 17",
            "Mar 18",
        ];
        const yValues = [
            53, 160, 57, 150, 220, 213, 200, 250, 220, 230, 295, 241, 276, 313,
        ];

        const ch = new Chart("staff-wars-chart", {
            type: "line",
            data: {
                labels: xValues,
                datasets: [
                    {
                        backgroundColor: "rgba(255,0,0,1.0)",
                        label: "Score",
                        borderColor: "rgba(255,0,0,0.1)",
                        data: yValues,
                    },
                ],
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Score achieved in "Staff Wars" game over time',
                    },
                },
            },
        });

        return () => {
            ch.destroy();
        };
    }, []);

    return (
        <canvas
            id="staff-wars-chart"
            style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
        ></canvas>
    );
}
function ConsecutiveNotesChart() {
    useEffect(() => {
        const xValues = [
            "Mar 5",
            "Mar 6",
            "Mar 7",
            "Mar 8",
            "Mar 9",
            "Mar 10",
            "Mar 11",
            "Mar 12",
            "Mar 13",
            "Mar 14",
            "Mar 15",
            "Mar 16",
            "Mar 17",
            "Mar 18",
        ];
        const yValues = [
            0.1, 0.132, 0.215, 0.105, 0.232, 0.488, 0.333, 0.268, 0.511, 0.701,
            0.444, 0.65, 0.63, 0.73, 1,
        ];

        const ch = new Chart("cons", {
            type: "line",
            data: {
                labels: xValues,
                datasets: [
                    {
                        backgroundColor: "rgba(0,255,0,1.0)",
                        label: "Number of notes",
                        borderColor: "rgba(0,255,0,0.1)",
                        data: yValues,
                    },
                ],
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: "Number of consecutive notes played (Repeat Notes test)",
                    },
                },
                scales: {
                    y: {
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: function (value: number) {
                                return `${value * 100}%`;
                            },
                        },
                    },
                },
            },
        });

        return () => {
            ch.destroy();
        };
    }, []);

    return (
        <canvas
            id="cons"
            style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
        ></canvas>
    );
}
function RepeatNotesChart() {
    useEffect(() => {
        const xValues = [
            "Mar 5",
            "Mar 6",
            "Mar 7",
            "Mar 8",
            "Mar 9",
            "Mar 10",
            "Mar 11",
            "Mar 12",
            "Mar 13",
            "Mar 14",
            "Mar 15",
            "Mar 16",
            "Mar 17",
            "Mar 18",
        ];
        const yValues = [
            0.1, 0.132, 0.215, 0.105, 0.232, 0.488, 0.333, 0.268, 0.511, 0.701,
            0.444, 0.65, 0.63, 0.73, 1,
        ];

        const ch = new Chart("myChart", {
            type: "line",
            data: {
                labels: xValues,
                datasets: [
                    {
                        backgroundColor: "rgba(0,0,255,1.0)",
                        label: "Percentage",
                        borderColor: "rgba(0,0,255,0.1)",
                        data: yValues,
                    },
                ],
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Percentage of notes played correctly by ear in "Repeat Notes" exercise over time',
                    },
                },
                scales: {
                    y: {
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: function (value: number) {
                                return `${value * 100}%`;
                            },
                        },
                    },
                },
            },
        });

        return () => {
            ch.destroy();
        };
    }, []);

    return (
        <canvas
            id="myChart"
            style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
        ></canvas>
    );
}

export default function AnalyticsPage() {
    return (
        <>
            <Link to={"/"} className="return-button">
                back to home
            </Link>
            <div className={classes.containingFlex}>
                <h1>Analytics</h1>
                <div className={classes.scrollBox}>
                    <CollapsibleContainer>
                        <Collapsible text="Training-specific" depth={1}>
                            <Collapsible text="More" depth={2}>
                                <RepeatNotesChart></RepeatNotesChart>
                                <ConsecutiveNotesChart></ConsecutiveNotesChart>
                                <StaffWarsChart></StaffWarsChart>
                            </Collapsible>
                        </Collapsible>
                        <Collapsible text="General" depth={1}></Collapsible>
                    </CollapsibleContainer>
                </div>
            </div>
        </>
    );
}
