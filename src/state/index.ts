import EventEmitter from "events"
import { promiseWithResolvers } from "../utils/index.ts"

export type ExecuteApiMethodResult = {
  data?: any, typeName: string, fullMethodName: string, error?: any
}






export class ExecuteState extends EventEmitter {

  EXECUTE_END = 'executeEnd'
  TASKLIST_CLEAR = 'taskClear'
  ADD_TASK = 'addTask'
  private resultList: ExecuteApiMethodResult[] = []
  private taskList: string[] = []
  promiseWithResolvers = promiseWithResolvers<ExecuteApiMethodResult[]>()
  constructor() {
    super()
    this.init()
  }
  init() {
    this.addListener(this.EXECUTE_END, (result: ExecuteApiMethodResult) => {
      this.resultList.push(result)
      if (this.resultList.length === this.taskList.length) {
        this.emit(this.TASKLIST_CLEAR, this.resultList)
        this.promiseWithResolvers?.resolve(this.resultList)
      }
    })

    this.addListener(this.ADD_TASK, (taskName) => {
      this.taskList.push(taskName)
    })
  }

  get promise() {
    return this.promiseWithResolvers?.promise
  }

}

export const executeState = new ExecuteState()
