import LineModel from '@models/LineModel'
import LinePathModel from '@models/LinePathModel'
import OffsetModel from '@models/OffsetModel'
import PositionModel from '@models/PositionModel'
import { getNodePosition } from './AutoPosition'

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

export const generatePolygoinPoints = (size: number) => {
	const points = []
	const angle = (2 * Math.PI) / 8 // 8 sides for octagon
	for (let i = 0; i < 8; i++) {
		const x = size / 2 + (size / 2) * Math.cos(i * angle)
		const y = size / 2 + (size / 2) * Math.sin(i * angle)
		points.push(`${x},${y}`)
	}
	return points.join(' ')
}

export const elementGroupCenter = (
	elements: SVGElement[],
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1
): OffsetModel => {
	const rects = elements.map((el) => getNodePosition(el, offset, zoomLevel))

	const top = Math.min(...rects.map((r) => r.y - r.height / 2))
	const left = Math.min(...rects.map((r) => r.x - r.width / 2))
	const right = Math.max(...rects.map((r) => r.x + r.width / 2))
	const bottom = Math.max(...rects.map((r) => r.y + r.height / 2))
	const width = Math.round(right - left)
	const height = Math.round(bottom - top)

	return { x: left, y: top, width: width, height: height }
}

export const calculateLinePath = (data: LineModel): LinePathModel => {
	const { start, end, startSize, endSize } = data

	// Calculate deltas once
	const deltaX = end.x - start.x
	const deltaY = end.y - start.y

	// Use faster approximation for small distances or cache angles
	const startAngle = Math.atan2(deltaY, deltaX)
	const endAngle = startAngle + Math.PI // Opposite direction

	// Pre-calculate trigonometric values
	const startCos = Math.cos(startAngle)
	const startSin = Math.sin(startAngle)
	const endCos = Math.cos(endAngle)
	const endSin = Math.sin(endAngle)

	const startX = start.x + startSize * startCos
	const startY = start.y + startSize * startSin
	const endX = end.x + endSize * endCos
	const endY = end.y + endSize * endSin

	const midX = (startX + endX) * 0.5 // Faster than division
	const midY = (startY + endY) * 0.5
	const firstX = (startX + midX) * 0.5
	const firstY = (startY + midY) * 0.5
	const lastX = (endX + midX) * 0.5
	const lastY = (endY + midY) * 0.5

	return {
		pathData: `M${start.x} ${start.y} ${firstX} ${firstY} ${midX} ${midY} ${lastX} ${lastY} L${end.x} ${end.y}`,
		midX,
		midY,
		textLength: (data.info?.length || 1) * 11
	}
}
