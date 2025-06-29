const SVGMarker = () => {
	return (
		<defs>
			<marker id="arrow" orient="auto" markerWidth="8" markerHeight="16" refX="0.1" refY="8">
				<path d="M0,0 V16 L8,8 Z" fill="context-stroke" />
			</marker>
		</defs>
	)
}

export default SVGMarker
