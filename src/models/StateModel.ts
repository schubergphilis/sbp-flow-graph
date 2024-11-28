import PositionModel from './PositionModel'

export default interface StateModel {
	dragElement?: string
	isClusterDrag?: boolean
	zoomLevel?: number
	panPosition?: PositionModel
}
