import NodeModel from '@models/NodeModel'
import OffsetModel from '@models/OffsetModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'

export const AutoPosition = (
	graphId: string,
	nodeList: ProcessModel[] = [],
	positionList: NodeModel[] = [],
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1,
	spacing: number = 125
): NodeModel[] => {
	const viewport = getWindowDimensions() as unknown as OffsetModel
	const center: PositionModel = { x: Math.round(viewport.width / 2), y: Math.round(viewport.height / 2) }

	const posList = nodeList
		.sort((a) => (a.parent === undefined ? -1 : 0))
		.filter(({ isVisible }) => isVisible)
		.map(({ id, isVisible }) => {
			const node = document.getElementById(`X${graphId}_${id}`)! as unknown as SVGElement

			const isRoot = (node.getAttribute('data-node-root') ?? 'false') === 'true'

			const savedPos = positionList.find((item) => item.id === id && item.x !== 0 && item.y !== 0)

			const box: OffsetModel = getNodePosition(node, offset, zoomLevel)

			// Overwrite position for rootNode to the center of the page
			const pos: PositionModel = savedPos ? { x: savedPos.x, y: savedPos.y } : isRoot ? center : { x: box.x, y: box.y }

			setNodePosition(node, box, pos)

			determenChildPositions(node, box, pos, offset, spacing, zoomLevel)

			return { id: id, x: pos.x, y: pos.y, isVisible: isVisible }
		})

	return posList
}

export const getParentNode = (node: SVGElement): SVGElement | HTMLDivElement | null => {
	const parentId = node.getAttribute('data-node-parent') as string
	return document.getElementById(parentId) as SVGElement | HTMLDivElement | null
}

export const getParentNodePosition = (
	node: SVGElement,
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1
): OffsetModel => {
	const parent = getParentNode(node)?.querySelector<SVGElement>('circle, rect, polygon') ?? null
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
	const width = pos.width > 0 ? pos.width : size * 1.25
	const height = pos.height > 0 ? pos.height : size * 2

	return {
		width: Math.round(width / zoomLevel),
		height: Math.round(height / zoomLevel),
		x: Math.round((pos.x + pos.width / 2 - offset.x) / zoomLevel),
		y: Math.round((pos.y + pos.height / 2 - offset.y) / zoomLevel)
	}
}

export const getTargetOffset = (target: SVGElement | HTMLDivElement | null): OffsetModel => {
	const pos = target?.getAttribute('data-pos')?.split(',') ?? ['0', '0']
	const size = Number(target?.getAttribute('data-node-size') ?? 0)
	return { x: Number(pos[0]), y: Number(pos[1]), width: size, height: size }
}

const setNodePosition = (node: SVGElement, box: OffsetModel, pos: PositionModel) => {
	node.setAttribute('data-pos', `${pos.x},${pos.y}`)
	node.setAttribute('fill-opacity', '1')

	node.setAttribute(
		'transform',
		`translate(${Math.round(pos.x - box.width / 2)}, ${Math.round(pos.y - box.height / 2)})`
	)
}

const calculateRadius = (
	pos: OffsetModel,
	children: SVGElement[],
	spacing: number,
	offset: PositionModel,
	zoomLevel: number
): number => {
	const list = children.map((child) => getNodePosition(child, offset, zoomLevel))

	const maxChildSize = Math.max(...list.map(({ width, height }) => Math.max(width, height)))

	const totalWidth = list.reduce((sum, { width, height }) => sum + Math.max(width, height), 0)
	const totalSpace = spacing * list.length

	const minCircumference = Math.round(2 * Math.PI * (Math.max(pos.width, pos.height) / 2 + spacing + maxChildSize / 2))

	const circumference = Math.max(totalWidth + totalSpace, minCircumference)

	const radius = Math.round(circumference / (2 * Math.PI))

	return radius
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

const getChildList = (node: SVGElement): SVGElement[] => {
	const nodeId = node.getAttribute('id') as string
	const childList = [
		...(document.querySelectorAll<SVGElement>(`[data-node-parent=${nodeId}][data-node-visible=true]`) ?? [])
	]

	return childList
}

const determenChildPositions = (
	node: SVGElement,
	box: OffsetModel,
	pos: PositionModel,
	offset: PositionModel,
	spacing: number,
	zoomLevel: number
) => {
	const childList = getChildList(node)

	const total = childList.length
	const radius = calculateRadius(box, childList, spacing, offset, zoomLevel)

	childList.forEach((child, index) => {
		const box = getNodePosition(child, offset, zoomLevel)
		const angle = ((2 * Math.PI) / total) * index

		const posX = pos.x + Math.round(radius * Math.cos(angle))
		const posY = pos.y + Math.round(radius * Math.sin(angle))

		const childPos: PositionModel = { x: posX, y: posY }
		setNodePosition(child, box, childPos)
	})
}
