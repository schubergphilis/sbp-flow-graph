const SVGInnerShadow = () => {
	return (
		<filter id="innershadow" height="150%" width="150%">
			<feGaussianBlur in="SourceAlpha" stdDeviation="3" />
			<feOffset dx="-1.5" dy="-1.5" result="offsetblur" />
			<feComponentTransfer>
				<feFuncA type="linear" slope="0.5" />
			</feComponentTransfer>
			<feMerge>
				<feMergeNode />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	)
}

export default SVGInnerShadow
