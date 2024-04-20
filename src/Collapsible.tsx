import { ReactElement, PropsWithChildren, useState } from "react";
type CollapsibleProps = PropsWithChildren<{
    text: string;
    depth: number | null;
}>;

import classes from "./Collapsible.module.css";

const DEPTH_FACTOR = 0.8;

type CollapsibleContainerProps = PropsWithChildren<Record<never, never>>;

export function CollapsibleContainer({ children }: CollapsibleContainerProps) {
    return <div className={classes.collapsibleContainer}>{children}</div>;
}

export function Collapsible({
    text,
    children,
    depth,
}: CollapsibleProps): ReactElement {
    const [collapsed, setCollapsed] = useState(true);

    function onButtonClick() {
        setCollapsed(!collapsed);
    }

    const arrowClassName = collapsed
        ? `${classes.arrow} ${classes.collapsed}`
        : `${classes.arrow} ${classes.expanded}`;

    return (
        <div className={classes.containingDiv}>
            <label>
                {depth !== null && (
                    <span
                        style={{
                            width: `${depth * DEPTH_FACTOR}em`,
                            marginLeft: `${-(depth - 1) * DEPTH_FACTOR * 2}em`,
                        }}
                        className={classes.line}
                    />
                )}
                <button className={classes.text} onClick={onButtonClick}>
                    {text}
                </button>
                <div className={arrowClassName}></div>
                {!collapsed && (
                    <div className={classes.content}>{children}</div>
                )}
            </label>
        </div>
    );
}
