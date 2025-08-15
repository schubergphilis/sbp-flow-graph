import { ProcessType } from '@datatypes/ProcessType'
import { StatusType } from '@datatypes/StatusType'

export default interface ProcessModel {
	id: string
	referenceId?: string
	name?: string
	value: number
	root?: boolean
	status?: StatusType
	type?: ProcessType
	icon?: string
	parent?: string
	badge?: number
	tooltip?: string
	info?: string
	infoTooltip?: string
	/** @description Only use for transformation */
	hasChildren?: boolean
	/** @description Only use for transformation */
	childStatus?: StatusType
	/** @description Only use for transformation */
	isVisible?: boolean
}
