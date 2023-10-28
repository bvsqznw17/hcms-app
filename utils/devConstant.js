const MAX_D = 20;               // 最多斗数量
const MAX_G = 1;                // 最多斗分组
const MAX_DG = 21;              // 斗数量和斗分组之和
const MAX_DPG = 20;             // 每组最多斗数量
const MAX_G1 = MAX_G + 1;       // 斗分组加一
const MAX_DG1 = MAX_DG + 1;     // 斗数量和斗分组之和加一
const MAX_DGG1 = MAX_DG + MAX_G1;   // 单层斗**之和
const MAX_DDG = MAX_G + MAX_D * 2;   // 双层斗**之和

Object.freeze({
    MAX_D,
    MAX_G,
    MAX_DG,
    MAX_DPG,
    MAX_G1,
    MAX_DG1,
    MAX_DGG1,
    MAX_DDG
});

const ctrlno = Object.freeze({
    CTL_NONE: 0,
    CTL_RUN: 1,
    CTL_MANUAL_ONCE: 2,
    CTL_MANUAL_CONTINUE: 3,
    CTL_MANUAL_ZZJ: 4,
    CTL_MANUAL_XZJ: 5,
    CTL_MANUAL_HCD: 6,
    CTL_MANUAL_CZD: 7,
    CTL_MANUAL_JYD: 8,
    CTL_MANUAL_JLD: 9,
    CTL_DOU_PROHIBIT: 10,
    CTL_DOU_TEST: 11,
    CTL_DOU_CALIZERO: 12,
    CTL_DOU_CALIFULL: 13,
    CTL_SAVE_SYSTEM: 14,
    CTL_SAVE_PROGRAM: 15,
    CTL_MANUAL_ZERO: 16,
    CTL_MANUAL_EMPTY: 17,
    CTL_MANUAL_CLEAN: 18,
    CTL_MANUAL_STOP: 19,
    CTL_PRMLIST: 20,
    CTL_PRM_WRITE: 21,
    CTL_PRM_READ: 22,
    CTL_PRM_SELECT: 23,
    CTL_PRM_DELETE: 24,
    CTL_PRM_COPY: 25,
    CTL_MOTOR_SEARCH: 26,
    CTL_MOTOR_SELECT: 27,
    CTL_MOTOR_COPY: 28,
    CTL_RECOARD_SEARCH: 29,
    CTL_RECOARD_CLEAN: 30,
    CTL_MOTOR_TEST: 31,
    CTL_MSV: 32,
    CTL_SEZ: 33,
    CTL_QLTJ: 34,
    CTL_PRMSAVE: 35,
    CTL_PRM_READ1: 36,
    CTL_TEST_IOOUT: 37,
    CTL_TEST_DOUKAIMEN: 38,
    CTL_TEST_ZHENDONG: 39,
    CTL_READ_MKSTATUS: 40,
    CTL_INTO_PAGE: 41,
    CTL_IN_TWEIGHT: 42
});

const E_MotorMode = Object.freeze({
    MM_UNDEFINE: -1,
    MM_BUFFER: 0x00,
    MM_WEIGHT: 0x10,
    MM_JYD: 0x20,
    MM_COLLECT: 0x30,
    MM_MAIN_VIB: 0x40
});

export { ctrlno, E_MotorMode };