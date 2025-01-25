import { jsx } from "@emotion/react";
import React from "react";

/**
 * @param {{
*  target:string,
*  href: string,
*  condition: boolean,
*  className?: string,
*  children?:React.ReactNode,
*  style?:CSSProperties
* }} 
*/

export function ConditionalAnchor(props){

    const {target,
        href,
        condition,
        className,
        children} = props;
    
    if (condition){
        return(
            <a href={href} target={target} className={className}>
                {children}
            </a>
        )
    }else{
            <>
                {children}
            </>
    }





}