import OffsetModel from '../models/OffsetModel'
import PositionModel from '../models/PositionModel'

export const AutoPosition = (spacing: number = 25): void => {
	const viewport = getWindowDimensions() as unknown as OffsetModel

	const nodes = [...(document.querySelectorAll<SVGElement>('[data-node]') ?? [])]

	nodes.forEach((node) => {
		const type = (node.getAttribute('data-node-type') ?? 'circle') as string

		const pos: OffsetModel = calculatePosition(node, spacing, viewport)

		node.setAttribute('fill-opacity', '1')
		node.setAttribute('data-pos', `${pos.x}, ${pos.y}`)

		switch (type) {
			case 'circle':
				node.setAttribute('cx', `${pos.x}`)
				node.setAttribute('cy', `${pos.y}`)
				break
			default:
				node.setAttribute('x', `${pos.x}`)
				node.setAttribute('y', `${pos.y}`)
				break
		}
	})
}

export const getParentNodePosition = (
	node: SVGElement,
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1
): OffsetModel => {
	const parentId = node.getAttribute('data-node-parent') as string
	const parent = document.querySelector<SVGElement>(`[data-node-id=${parentId}]`)

	return getNodePosition(parent, offset, zoomLevel)
}

export const getNodePosition = (
	node: SVGElement | HTMLDivElement | null,
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1
): OffsetModel => {
	const pos = node?.getBoundingClientRect() ?? { width: 0, height: 0, x: 0, y: 0 }

	return {
		width: Math.round(pos.width / zoomLevel),
		height: Math.round(pos.height / zoomLevel),
		x: Math.round((pos.x + pos.width / 2 - offset.x) / zoomLevel),
		y: Math.round((pos.y + pos.height / 2 - offset.y) / zoomLevel)
	}
}

const getWindowDimensions = (): { width: number; height: number } => {
	const hasWindow = typeof window !== 'undefined'

	const width = hasWindow ? window.innerWidth : 0
	const height = hasWindow ? window.innerHeight : 0

	return {
		width,
		height
	}
}

const getParentChildList = (node: SVGElement): OffsetModel[] => {
	const nodeId = node.getAttribute('data-node-id') as string
	const parentId = node.getAttribute('data-node-parent') as string
	const childList = [
		...(document.querySelectorAll<SVGElement>(`[data-node-parent=${parentId}]:not([data-node-id=${nodeId}])`) ?? [])
	]

	return childList.map((child) => getNodePosition(child))
}

const getNodeChildList = (node: SVGElement): OffsetModel[] => {
	const nodeId = node.getAttribute('data-node-id') as string
	const childList = [...(document.querySelectorAll<SVGElement>(`[data-node-parent=${nodeId}]`) ?? [])]

	return childList.map((child) => getNodePosition(child))
}

const calculatePosition = (node: SVGElement, spacing: number, viewport: OffsetModel): OffsetModel => {
	const isRoot = (node.getAttribute('data-node-root') ?? false) as boolean

	const parentChildList = getParentChildList(node)
	const nodeChildList = getNodeChildList(node)

	let freeSpace = 0
	let pos = { x: 0, y: 0 } as OffsetModel
	let i = 0

	do {
		pos = positionNode(node, nodeChildList.length > 0 ? spacing * 4 : spacing)
		freeSpace = parentChildList.find((child) => isCircleColliding(child, pos) && child) === undefined ? 1 : 0
		i++
	} while (freeSpace < 1 || (freeSpace == 0 && i < 20))

	if (isRoot) {
		// Overwrite position for rootNode to the center of the page
		pos.x = Math.round(viewport.width / 2)
		pos.y = Math.round(viewport.height / 2)
	}

	return pos
}

const isCircleColliding = (circle1: OffsetModel, circle2: OffsetModel): boolean => {
	const distance = Math.sqrt(
		(circle2.x - circle1.x) * (circle2.x - circle1.x) + (circle2.y - circle1.y) * (circle2.y - circle1.y)
	)

	return distance <= circle1.width / 2 + circle2.width / 2 // Collision check
}

const randomCirclePosition = (node: OffsetModel, parent: OffsetModel, spacing: number): PositionModel => {
	const radius = parent.width / 2 + node.width / 2 + spacing

	const angle = Math.random() * Math.PI * 2

	const randomX = Math.round(Math.cos(angle) * radius)
	const randomY = Math.round(Math.sin(angle) * radius)

	const posX = parent.x + randomX
	const posY = parent.y + randomY
	return { x: posX, y: posY }
}

const positionNode = (node: SVGElement, spacing: number): OffsetModel => {
	const nodeOffset = getNodePosition(node)
	const parentOffset = getParentNodePosition(node)
	const type = (node.getAttribute('data-node-type') ?? 'circle') as string

	let position = { x: 0, y: 0 } as PositionModel

	switch (type) {
		case 'circle':
			position = randomCirclePosition(nodeOffset, parentOffset, spacing)
			break
		default:
	}

	return { ...position, width: nodeOffset.width, height: nodeOffset.height }
}
