import NodeModel from '@models/NodeModel'
import OffsetModel from '@models/OffsetModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'
import { getRandomNumberBetween } from './Helpers'

export const AutoPosition = (
	nodeList: ProcessModel[] = [],
	positionList: NodeModel[] = [],
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1,
	spacing: number = 125
): NodeModel[] => {
	const viewport = getWindowDimensions() as unknown as OffsetModel

	const posList = nodeList
		.sort((a) => (a.parent === undefined ? -1 : 0))
		.filter(({ isVisible }) => isVisible)
		.map(({ id, isVisible }) => {
			const node = document.querySelector<SVGElement>(`[data-node-id=X${id}]`)!

			const savedPos = positionList.find((item) => item.id === id && item.x !== 0 && item.y !== 0)

			const box: OffsetModel = savedPos
				? getNodePosition(node, offset, zoomLevel)
				: calculatePosition(node, spacing, viewport, offset, zoomLevel)
			const pos: PositionModel = savedPos ? { x: savedPos.x, y: savedPos.y } : { x: box.x, y: box.y }

			node.setAttribute('data-pos', `${pos.x},${pos.y}`)

			const group = node.closest('[data-node]')

			if (!group) return { id: id, x: pos.x, y: pos.y, isVisible: isVisible }

			group.setAttribute('fill-opacity', '1')

			group?.setAttribute(
				'transform',
				`translate(${Math.round(pos.x - box.width / 2)}, ${Math.round(pos.y - box.height / 2)})`
			)

			return { id: id, x: pos.x, y: pos.y, isVisible: isVisible }
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
	const size = Number(node?.getAttribute('data-node-size') ?? 0)

	// Temp size for auto position isColliding()
	const width = pos.width > 0 ? pos.width : size
	const height = pos.height > 0 ? pos.height : size * 1.5

	return {
		width: Math.round(width / zoomLevel),
		height: Math.round(height / zoomLevel),
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
	spacing: number,
	viewport: OffsetModel,
	offset: PositionModel,
	zoomLevel: number
): OffsetModel => {
	const isRoot = (node.getAttribute('data-node-root') ?? 'false') === 'true'

	const parentChildList = getParentChildList(node, offset, zoomLevel)

	let freeSpace = 0
	let pos = { x: 0, y: 0 } as OffsetModel
	let i = 0
	do {
		pos = positionNode(node, spacing, offset, zoomLevel)
		const found = parentChildList.find((child) => isCircleColliding(child, pos))
		freeSpace = found === undefined ? 1 : 0
		i++
	} while (i < 20 && freeSpace < 1)

	if (isRoot) {
		// Overwrite position for rootNode to the center of the page
		pos.x = Math.round(viewport.width / 2)
		pos.y = Math.round(viewport.height / 2)
	}

	return pos
}

const isCircleColliding = (circle1: OffsetModel, circle2: OffsetModel): boolean => {
	return !(
		circle1.x + circle1.width < circle2.x ||
		circle1.x > circle2.x + circle2.width ||
		circle1.y + circle1.height < circle2.y ||
		circle1.y > circle2.y + circle2.height
	)
}
const _isCircleColliding = (circle1: OffsetModel, circle2: OffsetModel): boolean => {
	const a = Math.max(circle1.width, circle1.height) + Math.max(circle2.width, circle2.height)
	const x = circle1.x - circle2.x
	const y = circle1.y - circle2.y

	const distance = Math.sqrt(x * x + y * y)
	return a > distance
}

const randomPosition = (node: OffsetModel, parent: OffsetModel, spacing: number): PositionModel => {
	const size = parent.width + node.width + spacing
	const radius = getRandomNumberBetween(size, size * 2)

	const angle = Math.random() * Math.PI * 2

	const randomX = Math.round(Math.cos(angle) * radius)
	const randomY = Math.round(Math.sin(angle) * radius)

	const posX = parent.x + randomX
	const posY = parent.y + randomY
	return { x: posX, y: posY }
}

const positionNode = (node: SVGElement, spacing: number, offset: PositionModel, zoomLevel: number): OffsetModel => {
	// const target = node.querySelector<SVGElement>('circle, rect')!
	const nodeOffset = getNodePosition(node, offset, zoomLevel)
	const parentOffset = getParentNodePosition(node, offset, zoomLevel)

	const position = randomPosition(nodeOffset, parentOffset, spacing)

	return { ...position, width: nodeOffset.width, height: nodeOffset.height }
}
