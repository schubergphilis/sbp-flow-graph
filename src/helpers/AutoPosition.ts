import NodeModel from '../models/NodeModel'
import OffsetModel from '../models/OffsetModel'
import PositionModel from '../models/PositionModel'
import { ProcessModel } from '../models/ProcessModel'

export const AutoPosition = (
	nodeList: ProcessModel[] = [],
	positionList: NodeModel[] = [],
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1,
	spacing: number = 25
): NodeModel[] => {
	const viewport = getWindowDimensions() as unknown as OffsetModel

	const posList = nodeList.map(({ id, hasChildren }) => {
		const node = document.querySelector<SVGElement>(`[data-node-id=X${id}]`)!

		const savedPos = positionList.find((item) => item.id === id && item.x !== 0 && item.y !== 0)

		const box: OffsetModel = calculatePosition(node, hasChildren ?? false, spacing, viewport, offset, zoomLevel)
		const pos: PositionModel = savedPos ? { x: savedPos.x, y: savedPos.y } : { x: box.x, y: box.y }

		node.setAttribute('data-pos', `${pos.x}, ${pos.y}`)

		const group = node.closest('g[data-node]')

		if (!group) return { id: id, x: pos.x, y: pos.y, isVisible: false }

		group.setAttribute('fill-opacity', '1')

		group?.setAttribute('transform', `translate(${pos.x - box.width / 2}, ${pos.y - box.height / 2})`)

		return { id: id, x: pos.x, y: pos.y, isVisible: true }
	})

	return posList
}

export const getParentNode = (node: SVGElement): SVGElement | HTMLDivElement | null => {
	const parentId = node.getAttribute('data-node-parent') as string
	return document.querySelector<SVGElement>(`[data-node-id=${parentId}]`)
}

export const getParentNodePosition = (
	node: SVGElement,
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1
): OffsetModel => {
	const parent = getParentNode(node)?.querySelector<SVGElement>('circle, rect') ?? null

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

const calculatePosition = (
	node: SVGElement,
	hasChildren: boolean,
	spacing: number,
	viewport: OffsetModel,
	offset: PositionModel,
	zoomLevel: number
): OffsetModel => {
	const isRoot = (node.getAttribute('data-node-root') ?? false) as boolean

	const parentChildList = getParentChildList(node, offset, zoomLevel)

	let freeSpace = 0
	let pos = { x: 0, y: 0 } as OffsetModel
	let i = 0

	do {
		pos = positionNode(node, hasChildren ? spacing * 3 : spacing, offset, zoomLevel)
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
	const target = node.querySelector<SVGElement>('circle, rect')!
	const nodeOffset = getNodePosition(target, offset, zoomLevel)
	const parentOffset = getParentNodePosition(node, offset, zoomLevel)

	const position = randomPosition(nodeOffset, parentOffset, spacing)

	return { ...position, width: nodeOffset.width, height: nodeOffset.height }
}
