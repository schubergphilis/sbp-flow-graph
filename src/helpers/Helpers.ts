export const firstToUpperCase = (item: string): string => {
	return item ? item[0].toUpperCase() + item.slice(1).toLowerCase() : ''
}

export const generateSteps = (firstStep: number, lastStep: number, stepSize: number): number[] => {
	const steps: number[] = []

	// Push the first step into the array
	steps.push(firstStep)

	// Calculate the number of steps needed in between
	const numOfSteps = Math.ceil((lastStep - firstStep) / stepSize)

	// Generate the steps
	for (let i = 1; i <= numOfSteps; i++) {
		const nextStep = Math.min(firstStep + i * stepSize, lastStep)
		steps.push(nextStep)
	}

	return steps
}

export const closestNumber = (counts: number[], goal: number): number => {
	return counts.reduce((prev, curr) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev))
}

export const getRandomNumberBetween = (start: number, end: number): number => {
	const randomNumber = Math.random() * (end - start) + start
	return Math.round(randomNumber * 100) / 100
}
