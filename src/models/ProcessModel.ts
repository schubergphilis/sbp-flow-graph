//import { UserDataModel } from './UserDataModel'

import { ProcessType } from '../datatypes/ProcessType'

export interface ProcessModel {
	id: string
	name?: string
	value: number
	root?: boolean
	type: ProcessType
	clickable?: boolean
	children?: ProcessModel[]
	parent?: string // used when flatmapping this tree
	//userData: UserDataModel
}
