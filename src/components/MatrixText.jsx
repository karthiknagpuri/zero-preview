import { useState, useRef, useCallback } from 'react';

const MatrixText = ({
  defaultText = 'Zero',
  hoverText = 'Karthik Nagapuri',
  style = {},
  className = '',
}) => {
  const [displayText, setDisplayText] = useState(defaultText);
  const [currentTarget, setCurrentTarget] = useState('default');
  const intervalRef = useRef(null);

  const matrixChars =
    'అఆఇఈఉఊఋఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరలవశషసహళక్షఱ0123456789';

  const scrambleText = useCallback(
    (fromText, targetText) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const duration = 1000;
      const frameRate = 30;
      const totalFrames = duration / (1000 / frameRate);
      let frame = 0;

      const maxLength = Math.max(fromText.length, targetText.length);

      intervalRef.current = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;

        let newText = '';
        
        for (let index = 0; index < maxLength; index++) {
          const targetChar = targetText[index] || '';
          const fromChar = fromText[index] || '';
          
          // Calculate when this character should start and finish transitioning
          const charStartProgress = index / maxLength;
          const charEndProgress = (index + 3) / maxLength;
          
          if (progress >= charEndProgress) {
            // Character fully transitioned to target
            newText += targetChar;
          } else if (progress >= charStartProgress) {
            // Character is in scramble phase
            if (targetChar === '' && progress > 0.7) {
              // Shrinking: fade out extra characters near the end
              newText += '';
            } else if (targetChar === ' ' || fromChar === ' ') {
              newText += ' ';
            } else {
              newText += matrixChars[Math.floor(Math.random() * matrixChars.length)];
            }
          } else {
            // Character hasn't started transitioning yet - show from character
            newText += fromChar;
          }
        }

        setDisplayText(newText);

        if (frame >= totalFrames) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setDisplayText(targetText);
        }
      }, 1000 / frameRate);
    },
    [matrixChars]
  );

  const handleMouseEnter = useCallback(() => {
    if (currentTarget !== 'hover') {
      setCurrentTarget('hover');
      scrambleText(displayText, hoverText);
    }
  }, [currentTarget, displayText, hoverText, scrambleText]);

  const handleMouseLeave = useCallback(() => {
    if (currentTarget !== 'default') {
      setCurrentTarget('default');
      scrambleText(displayText, defaultText);
    }
  }, [currentTarget, displayText, defaultText, scrambleText]);

  return (
    <span
      className={className}
      style={{
        ...style,
        cursor: 'pointer',
        display: 'inline-block',
        position: 'relative',
        maxWidth: '100%',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Invisible text to maintain width of longer text */}
      <span style={{ visibility: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
        {hoverText.length > defaultText.length ? hoverText : defaultText}
      </span>
      {/* Actual displayed text positioned absolutely */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {displayText}
      </span>
    </span>
  );
};

export default MatrixText;
