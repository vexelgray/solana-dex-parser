"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionClassifier = void 0;
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class InstructionClassifier {
    constructor(adapter) {
        this.adapter = adapter;
        this.instructionMap = new Map();
        this.classifyInstructions();
    }
    classifyInstructions() {
        // outer instructions
        this.adapter.instructions.forEach((instruction, outerIndex) => {
            const programId = this.adapter.getInstructionProgramId(instruction);
            this.addInstruction({
                instruction,
                programId,
                outerIndex,
            });
        });
        // innerInstructions
        const innerInstructions = this.adapter.innerInstructions;
        if (innerInstructions) {
            innerInstructions.forEach((set) => {
                set.instructions.forEach((instruction, innerIndex) => {
                    const programId = this.adapter.getInstructionProgramId(instruction);
                    this.addInstruction({
                        instruction,
                        programId,
                        outerIndex: set.index,
                        innerIndex,
                    });
                });
            });
        }
    }
    addInstruction(classified) {
        if (!classified.programId)
            return;
        const instructions = this.instructionMap.get(classified.programId) || [];
        instructions.push(classified);
        this.instructionMap.set(classified.programId, instructions);
    }
    getInstructions(programId) {
        return this.instructionMap.get(programId) || [];
    }
    getMultiInstructions(programIds) {
        return programIds.map((programId) => this.getInstructions(programId)).flat();
    }
    getInstructionByDescriminator(descriminator, slice) {
        for (const instructions of this.instructionMap.values()) {
            for (const instruction of instructions) {
                const data = (0, utils_1.getInstructionData)(instruction.instruction);
                if (data.length >= slice && descriminator.equals(data.slice(0, slice))) {
                    return instruction;
                }
            }
        }
        return null;
    }
    getAllProgramIds() {
        return Array.from(this.instructionMap.keys()).filter((it) => !constants_1.SYSTEM_PROGRAMS.includes(it) && !constants_1.SKIP_PROGRAM_IDS.includes(it));
    }
}
exports.InstructionClassifier = InstructionClassifier;
//# sourceMappingURL=instruction-classifier.js.map