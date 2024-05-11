import React, { useEffect, useRef } from 'react';
import { Button } from '@chakra-ui/react';

function StakeButton({ withdraw, isSelectedPositionUnlocked }) {
    const buttonRef = useRef(null);  // Create a ref for the button

    useEffect(() => {
        // Check if the condition is true and the button is not null
        if (isSelectedPositionUnlocked && buttonRef.current) {
            buttonRef.current.click();  // Programmatically click the button
        }
    }, [isSelectedPositionUnlocked]);  // Re-run effect when the condition changes

    return (
        <Button 
            mt={10}
            ml={60}
            w={120} 
            style={{border:"1px solid white", borderRadius:"10px"}}
            onClick={() => withdraw()}
            isDisabled={!isSelectedPositionUnlocked}
            ref={buttonRef}  // Attach the ref to the button
        >
            Exit
        </Button>
    );
}

export default StakeButton;