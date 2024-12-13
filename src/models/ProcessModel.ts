import { ProcessType } from '../datatypes/ProcessType'
import { StatusType } from '../datatypes/StatusType'

export interface ProcessModel {
	id: string
	name?: string
	value: number
	root?: boolean
	type?: ProcessType
	hasChildren?: boolean
	parent?: string
	status?: StatusType
	childStatus?: StatusType
}
