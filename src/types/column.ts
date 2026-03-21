import { Constraint } from "./constraints"

export type Column =  {
    name : string,
    type : string,
    constraints : Constraint[]
}