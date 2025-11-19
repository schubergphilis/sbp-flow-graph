import { StatusType } from '@datatypes/StatusType'
import OffsetModel from './OffsetModel'

export default interface LineModel {
	start: OffsetModel
	end: OffsetModel
	id?: string
	parentId?: string
	info: string
	tooltip?: string
	startSize: number
	endSize: number
	status?: StatusType
}
