import { ProcessType } from '../datatypes/ProcessType'

export interface ProcessModel {
	id: string
	name?: string
	value: number
	root?: boolean
	type?: ProcessType
	hasChildren?: boolean
	parent?: string
}
