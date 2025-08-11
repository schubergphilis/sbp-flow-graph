const SVGStripes = () => {
	return (
		<defs>
			<linearGradient
				id="stripes"
				x1="0%"
				y1="0%"
				x2="100%"
				y2="100%"
				gradientTransform="scale(0.6) translate(0.4, 0.4)">
				<stop offset="0%" stopColor="rgb(144, 99, 205)" />
				<stop offset="0%" stopColor="rgb(158, 119, 212)" />

				<stop offset="15%" stopColor="rgb(158, 119, 212)" />
				<stop offset="15%" stopColor="rgb(144, 99, 205)" />

				<stop offset="30%" stopColor="rgb(144, 99, 205)" />
				<stop offset="30%" stopColor="rgb(158, 119, 212)" />

				<stop offset="45%" stopColor="rgb(158, 119, 212)" />
				<stop offset="45%" stopColor="rgb(144, 99, 205)" />

				<stop offset="60%" stopColor="rgb(144, 99, 205)" />
				<stop offset="60%" stopColor="rgb(158, 119, 212)" />

				<stop offset="75%" stopColor="rgb(158, 119, 212)" />
				<stop offset="75%" stopColor="rgb(144, 99, 205)" />

				<stop offset="90%" stopColor="rgb(144, 99, 205)" />
				<stop offset="90%" stopColor="rgb(158, 119, 212)" />

				<animateTransform
					attributeName="gradientTransform"
					attributeType="XML"
					type="translate"
					from="-0.6 0"
					to="0.6 0"
					dur="2s"
					repeatCount="indefinite"
				/>
			</linearGradient>
		</defs>
	)
}

export default SVGStripes
