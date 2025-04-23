import { StatusType } from '@datatypes/StatusType'
import PositionModel from './PositionModel'

export default interface LineModel {
	start: PositionModel
	end: PositionModel
	id: string
	parentId: string
	info?: string
	startSize: number
	endSize: number
	status: StatusType
}
