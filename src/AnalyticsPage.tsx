import classes from "./AnalyticsPage.module.css";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContainer } from "./Collapsible";

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
                                askjdfkasjf
                            </Collapsible>
                        </Collapsible>
                        <Collapsible text="General" depth={1}></Collapsible>
                    </CollapsibleContainer>
                </div>
            </div>
        </>
    );
}
