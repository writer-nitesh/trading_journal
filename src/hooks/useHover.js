import { useState, useRef, useEffect } from 'react';

// For single element hover
const useHover = () => {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return [ref, isHovered];
};

// For multiple elements hover (like in a map)
const useHoverIndex = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const getHoverProps = (index) => ({
        onMouseEnter: () => setHoveredIndex(index),
        onMouseLeave: () => setHoveredIndex(null),
    });

    const isHovered = (index) => hoveredIndex === index;

    return { getHoverProps, isHovered };
};

export default useHover;
export { useHoverIndex };