import NodeModel from '@models/NodeModel'
import OffsetModel from '@models/OffsetModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'

export const AutoPosition = (
	graphId: string,
	selectedElement: string | undefined,
	nodeList: ProcessModel[] = [],
	positionList: NodeModel[] = [],
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1,
	spacing: number = 125
): NodeModel[] => {
	const viewport = document.getElementById(graphId) as HTMLElement
	const viewportSize = viewport?.getBoundingClientRect() ?? { width: 0, height: 0 }
	const center: PositionModel = {
		x: Math.round(viewportSize.width / 2),
		y: Math.round(viewportSize.height / 2)
	}

	const adjustList = [...nodeList].sort((a) => (a.root ? -1 : 0)).filter(({ isVisible }) => isVisible)
	// .filter(({ parent, id }) => (selectedElement ? parent === selectedElement || id === selectedElement : true))

	for (let i = 0; i < adjustList.length; i++) {
		const { id } = adjustList[i]
		const nodeId = `X${graphId}_${id}`
		const node = document.getElementById(nodeId) as SVGGElement | null

		if (!node) {
			console.warn('Node not found:', nodeId)
			continue
		}

		const isRoot = (node.getAttribute('data-node-root') ?? 'false') === 'true'

		const savedPos = positionList.find((item) => item.id === id && item.x !== 0 && item.y !== 0)

		const size: OffsetModel = getTargetOffset(node)
		const box: OffsetModel = getNodePosition(node, offset, zoomLevel)
		// Overwrite position for rootNode to the center of the page
		const pos: PositionModel = savedPos ? { x: savedPos.x, y: savedPos.y } : isRoot ? center : { x: size.x, y: size.y }

		setNodePosition(node, pos)

		if (
			node.hasAttribute('data-node-visible') &&
			node.hasAttribute('data-node-children') &&
			node.hasAttribute('data-node-children-visible')
		)
			determenChildPositions(node, box, pos, offset, spacing, zoomLevel)
	}

	const nodes = [
		...(document.getElementById(graphId)?.querySelectorAll<SVGElement>('[data-node][data-node-visible][data-pos]') ??
			[])
	]

	// Get all nodes with a position set
	return nodes.map((node) => {
		const id = node.id.match(/(?<=_)([\w-]+)/gim)?.[0] ?? ''
		const pos = node.getAttribute('data-pos')?.split(',') ?? ['0', '0']

		return {
			id,
			x: Number(pos[0]),
			y: Number(pos[1]),
			isVisible: true
		} as NodeModel
	})
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
	if (parent === null) console.warn('No parent node found for:', node)
	return getNodePosition(parent, offset, zoomLevel)
}

export const getNodePosition = (
	node: SVGElement | HTMLDivElement | null,
	offset: PositionModel = { x: 0, y: 0 },
	zoomLevel: number = 1
): OffsetModel => {
	const pos = node?.getBoundingClientRect() ?? { width: 0, height: 0, x: 0, y: 0 }
	const size = Number(node?.getAttribute('data-node-size') ?? 0)

	if (pos.width === 0) console.warn('Node has no width, check if it is rendered correctly:', node)

	// Temp size for auto position isColliding()
	const width = pos.width > 0 ? pos.width : size * 1.25
	const height = pos.height > 0 ? pos.height : size * 2

	return {
		width: Math.round(width / zoomLevel),
		height: Math.round(height / zoomLevel),
		x: Math.round((pos.x - offset.x) / zoomLevel),
		y: Math.round((pos.y - offset.y) / zoomLevel)
	}
}

export const getTargetOffset = (target: SVGElement | HTMLDivElement | null): OffsetModel => {
	const pos = target?.getAttribute('data-pos')?.split(',') ?? ['0', '0']
	const size = Number(target?.getAttribute('data-node-size') ?? 0)
	return { x: Number(pos[0]), y: Number(pos[1]), width: size, height: size }
}

const setNodePosition = (node: SVGElement, pos: PositionModel) => {
	node.setAttribute('data-pos', `${pos.x},${pos.y}`)
	node.setAttribute('transform', `translate(${pos.x}, ${pos.y})`)
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

const getChildList = (node: SVGElement): SVGElement[] => {
	const nodeId = node.id as string
	const childList = [...(document.querySelectorAll<SVGElement>(`[data-node-parent=${nodeId}]`) ?? [])]

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
	// Remove all children that already have a position set
	const childList = getChildList(node)

	const total = childList.length
	const radius = calculateRadius(box, childList, spacing, offset, zoomLevel)

	for (let i = 0; i < childList.length; i++) {
		const child = childList[i]
		const index = i

		const angle = ((2 * Math.PI) / total) * index

		const posX = pos.x + Math.round(radius * Math.cos(angle))
		const posY = pos.y + Math.round(radius * Math.sin(angle))

		const childPos = getTargetOffset(child)

		const savedPos: PositionModel =
			childPos.x !== 0 && childPos.y !== 0 ? { x: childPos.x, y: childPos.y } : { x: posX, y: posY }

		setNodePosition(child, savedPos)
	}
}
