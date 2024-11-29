import NodeModel from '../models/NodeModel'
import OffsetModel from '../models/OffsetModel'
import PositionModel from '../models/PositionModel'

export const AutoPosition = (
	positionList: NodeModel[] = [],
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1,
	spacing: number = 25
): NodeModel[] => {
	const viewport = getWindowDimensions() as unknown as OffsetModel

	const nodes = [...(document.querySelectorAll<SVGElement>('[data-node]') ?? [])]

	const posList = nodes.map((node) => {
		const type = (node.getAttribute('data-node-type') ?? 'circle') as string
		const id = node.getAttribute('data-node-id') as string

		const savedPos = positionList.find((item) => item.id === id)

		let pos: PositionModel = { x: 0, y: 0 }
		let randomPos: OffsetModel = { x: 0, y: 0, width: 0, height: 0 }

		if (savedPos) {
			pos = { x: savedPos.x, y: savedPos.y }
		} else {
			randomPos = calculatePosition(node, spacing, viewport, offset, zoomLevel)
			pos = { x: randomPos.x, y: randomPos.y }
		}

		node.setAttribute('fill-opacity', '1')
		node.setAttribute('data-pos', `${pos.x}, ${pos.y}`)

		switch (type) {
			case 'circle':
				node.setAttribute('cx', `${pos.x}`)
				node.setAttribute('cy', `${pos.y}`)
				break
			default:
				node.setAttribute('x', `${pos.x + randomPos?.width / 2}`)
				node.setAttribute('y', `${pos.y + randomPos?.height / 2}`)
				break
		}

		return { id: id, x: pos.x, y: pos.y }
	})

	return posList
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

const getParentChildList = (node: SVGElement, offset: PositionModel, zoomLevel: number): OffsetModel[] => {
	const nodeId = node.getAttribute('data-node-id') as string
	const parentId = node.getAttribute('data-node-parent') as string
	const childList = [
		...(document.querySelectorAll<SVGElement>(`[data-node-parent=${parentId}]:not([data-node-id=${nodeId}])`) ?? [])
	]

	return childList.map((child) => getNodePosition(child, offset, zoomLevel))
}

const getNodeChildList = (node: SVGElement, offset: PositionModel, zoomLevel: number): OffsetModel[] => {
	const nodeId = node.getAttribute('data-node-id') as string
	const childList = [...(document.querySelectorAll<SVGElement>(`[data-node-parent=${nodeId}]`) ?? [])]

	return childList.map((child) => getNodePosition(child, offset, zoomLevel))
}

const calculatePosition = (
	node: SVGElement,
	spacing: number,
	viewport: OffsetModel,
	offset: PositionModel,
	zoomLevel: number
): OffsetModel => {
	const isRoot = (node.getAttribute('data-node-root') ?? false) as boolean

	const parentChildList = getParentChildList(node, offset, zoomLevel)
	const nodeChildList = getNodeChildList(node, offset, zoomLevel)

	let freeSpace = 0
	let pos = { x: 0, y: 0 } as OffsetModel
	let i = 0

	do {
		pos = positionNode(node, nodeChildList.length > 0 ? spacing * 4 : spacing, offset, zoomLevel)
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

const randomPosition = (node: OffsetModel, parent: OffsetModel, spacing: number): PositionModel => {
	const radius = parent.width / 2 + node.width / 2 + spacing

	const angle = Math.random() * Math.PI * 2

	const randomX = Math.round(Math.cos(angle) * radius)
	const randomY = Math.round(Math.sin(angle) * radius)

	const posX = parent.x + randomX
	const posY = parent.y + randomY
	return { x: posX, y: posY }
}

const positionNode = (node: SVGElement, spacing: number, offset: PositionModel, zoomLevel: number): OffsetModel => {
	const nodeOffset = getNodePosition(node, offset, zoomLevel)
	const parentOffset = getParentNodePosition(node, offset, zoomLevel)

	const position = randomPosition(nodeOffset, parentOffset, spacing)

	return { ...position, width: nodeOffset.width, height: nodeOffset.height }
}
