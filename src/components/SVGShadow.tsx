const SVGShadow = () => {
	return (
		<filter id="dropshadow" height="150%" width="150%">
			<feGaussianBlur in="SourceAlpha" stdDeviation="4" />
			<feOffset dx="0" dy="1.5" result="offsetblur" />
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

export default SVGShadow
