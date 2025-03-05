import { ProcessType } from '@datatypes/ProcessType'
import { StatusType } from '@datatypes/StatusType'

export default interface ProcessModel {
	id: string
	name?: string
	value: number
	root?: boolean
	status?: StatusType
	type?: ProcessType
	icon?: string
	parent?: string
	badge?: number
	/** @description Only use for transformation */
	hasChildren?: boolean
	/** @description Only use for transformation */
	childStatus?: StatusType
}
