import NodeModel from '@models/NodeModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'
import { PayloadAction, createSlice, current } from '@reduxjs/toolkit'
import { AppState } from '@store/Store'

// Type for our state
export interface SettingsState {
	selectedElement?: string
	dragElement?: string
	isClusterDrag?: boolean
	zoomLevel: number
	panPosition?: PositionModel
	pageOffset: PositionModel
	positionList?: NodeModel[]
	dataList?: ProcessModel[]
	showInfo: boolean
	update?: number
	loaded?: number
	graphId?: string
}

// Initial state
const initialState: SettingsState = {
	zoomLevel: 1,
	showInfo: false,
	pageOffset: { x: 0, y: 0 }
}

// Actual Slice
export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setDragElementState(state, { payload }: PayloadAction<string | undefined>) {
			state.dragElement = payload
		},
		setClusterDragState(state, { payload }: PayloadAction<boolean>) {
			state.isClusterDrag = payload
		},
		setZoomLevelState(state, { payload }: PayloadAction<number>) {
			state.zoomLevel = payload
		},
		setPanPositionState(state, { payload }: PayloadAction<PositionModel>) {
			state.panPosition = payload
		},
		setPageOffsetState(state, { payload }: PayloadAction<PositionModel>) {
			state.pageOffset = payload
		},
		setShowInfoState(state, { payload }: PayloadAction<boolean>) {
			state.showInfo = payload
		},
		setPositionListState(state, { payload }: PayloadAction<NodeModel[]>) {
			const positionList: NodeModel[] = [...(state.positionList ?? [])]

			const list = positionList.map((item) => {
				const changedItem = payload.find(({ id }) => id === item.id)
				return changedItem ? changedItem : { ...item, isVisible: false }
			})

			// Add new nodes to the positionList
			const newNodes = payload.filter((item) => !list.some(({ id }) => item.id === id))

			const all = [...list, ...newNodes]
			state.positionList = all.length > 0 ? all : payload
		},
		setPositionState(state, { payload }: PayloadAction<NodeModel>) {
			const positionList: NodeModel[] = [...current(state.positionList ?? [])]

			const index = positionList.findIndex(({ id }) => id === payload.id)

			// Remove position when found
			if (index >= 0) positionList.splice(index, 1)

			state.positionList = [...positionList, payload]
		},
		setVisibleState(state, { payload }: PayloadAction<string>) {
			const id = payload.match(/(?<=_)([\w-]+)/gim)?.[0] ?? ''
			let positionList: NodeModel[] = [...current(state.positionList ?? [])]
			const dataList: ProcessModel[] = [...current(state.dataList ?? [])]

			const child = dataList.find(({ parent }) => parent === id)

			if (!child) return

			const showNodes = !(positionList.find(({ id }) => id === child.id)?.isVisible ?? false)

			// List To Affected Nodes
			let items = getVisibilityNodes(dataList, showNodes, id)

			// List of found positions
			const foundList = items
				.map(({ id }) => positionList.find((item) => item.id === id))
				.filter((item) => item !== undefined)

			// Change Visibility on found positions
			if (foundList.length > 0) {
				positionList = positionList.map<NodeModel>((item) => {
					const index = foundList.findIndex(({ id }) => item.id === id && item.isVisible === !showNodes)

					if (index >= 0) {
						return { ...item, isVisible: showNodes }
					}

					return item
				})
				items = []
			}

			if (items.length > 0) {
				state.positionList = [...positionList, ...items]
			} else {
				state.positionList = positionList
			}

			state.selectedElement = showNodes ? id : undefined

			state.update = (state.update || 0) + 1
		},
		setDataListState(state, { payload }: PayloadAction<ProcessModel[]>) {
			state.dataList = payload
		},
		setGraphIdState(state, { payload }: PayloadAction<string>) {
			state.graphId = payload
		},
		setUpdateState(state) {
			state.update = (state.update || 0) + 1
		},
		setLoadedState(state) {
			state.loaded = (state.loaded || 0) + 1
		}
	}
})

const getVisibilityNodes = (list: ProcessModel[], showNodes: boolean, id: string): NodeModel[] => {
	const items = list
		.filter(({ parent }) => parent === id)
		.flatMap<NodeModel>(({ id, hasChildren }) => {
			let childList: NodeModel[] = []
			if (hasChildren && !showNodes) {
				const nodes = getVisibilityNodes(list, showNodes, id)
				childList = [...childList, ...nodes]
			}
			childList.push({ id: id, isVisible: true, x: 0, y: 0 })
			return childList
		})

	return items
}

export const getDragElementState = (state: AppState): string | undefined => state.settings.dragElement

export const isClusterDragState = (state: AppState): boolean => state.settings.isClusterDrag || false

export const getZoomLevelState = (state: AppState): number => state.settings.zoomLevel

export const getPanPositionState = (state: AppState): PositionModel | undefined => state.settings.panPosition

export const getPageOffsetState = (state: AppState): PositionModel => state.settings.pageOffset

export const getPositionListState = (state: AppState): NodeModel[] | undefined => state.settings.positionList

export const getDataListState = (state: AppState): ProcessModel[] | undefined => state.settings.dataList

export const getUpdateState = (state: AppState): number => state.settings.update

export const getLoadedState = (state: AppState): number => state.settings.loaded

export const getShowInfoState = (state: AppState): boolean => state.settings.showInfo

export const getGraphIdState = (state: AppState): string => state.settings.graphId ?? 'flowGraph'

export const getSelectedElementState = (state: AppState): string | undefined => state.settings.selectedElement

export const {
	setDragElementState,
	setClusterDragState,
	setZoomLevelState,
	setPanPositionState,
	setPositionListState,
	setPositionState,
	setPageOffsetState,
	setDataListState,
	setVisibleState,
	setShowInfoState,
	setGraphIdState,
	setUpdateState,
	setLoadedState
} = settingsSlice.actions

export default settingsSlice.reducer
