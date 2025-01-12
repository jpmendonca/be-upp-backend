const Model = require("../data/models/final-report");
const { getAppointmentById } = require("./appointment");
const { listAppointments } = require("./doctor");
const { getLatestTemplate } = require("../service/template");
const { clone } = require("./helper");
const mongoose = require("mongoose");

const addFinalReportTemplate = async (data) => {
  try {
    let data2 = clone(data);
    data2.isTemplate = true;
    if (data2.version === null || data2.version === undefined) {
      data2.version = (await getLatestTemplate()).templateVersion;
    }
    await Model.find({ version: data2.version, isTemplate: true }).remove().exec();
    const dado = await Model.create(data2);
    return dado;
  } catch (error) {
    const err = {
      message: error.message,
      code: 400,
    };
    throw err;
  }
};

const getFinalReportTemplateByVersion = async (version) => {
  try {
    const dado = await Model.findOne({ version: version, isTemplate: true }).exec();
    return dado;
  } catch (error) {
    const err = {
      err: error,
      code: 500,
    };
    throw err;
  }
};

const addFinalReportData = async (formData, variables) => {
  try {
    const template = await getFinalReportTemplateByVersion(formData.templateVersion);
    const data = clone(template);

    delete data.isTemplate;
    delete data._id;
    delete data.__v;

    await getAppointmentById(formData.appointmentId);
    data.appointmentId = formData.appointmentId;

    for (let i in data.pages) {
      for (let j in data.pages[i].values) {
        let aux = variables[data.pages[i].values[j]];
        if (aux === undefined || aux === null) aux = "não definido";
        data.pages[i].values[j] = String(aux);
      }
    }

    await Model.find({ appointmentId: data.appointmentId }).remove().exec();
    const dado = await Model.create(data);
    return dado;
  } catch (error) {
    console.log(error);
    const err = {
      message: error.message,
      code: 400,
    };
    throw err;
  }
};

const getFinalReportData = async (appointmentId) => {
  try {
    const ap = await getAppointmentById(appointmentId);
    if (ap == null) return null;

    const dado = await Model.findOne({ appointmentId: mongoose.Types.ObjectId(appointmentId) }).exec();

    return dado;
  } catch (error) {
    const err = {
      err: error,
      code: 500,
    };
    throw err;
  }
};

const getFinalReportDataByDoctor = async(doctorId) => {
  try {
    const aps = await listAppointments(doctorId);

    if (aps == null) return null;

    let id = 0;

    const ids = [];
    let dados = [];

    aps.forEach((ap) => {
      id = mongoose.Types.ObjectId(ap._id);
      ids.push(id);
    });

    dados = await Model.find({ appointmentId: { $in: ids } });
    // dados = await Model.findOne({ appointmentId: mongoose.Types.ObjectId(ap._id) }).exec();

    // aps.then(function (result) {
    //   const res = result; // Now you can use res everywhere
    //   console.log(res);
    // });

    // aps.forEach((ap) => {
    //   dado.Add(Model.findOne({ appointmentId: mongoose.Types.ObjectId(ap._id) }).exec());
    // });

    return dados;
  } catch (error) {
    const err = {
      err: error,
      code: 500,
    };
    throw err;
  }
};

module.exports = {
  addFinalReportTemplate: addFinalReportTemplate,
  getFinalReportTemplateByVersion: getFinalReportTemplateByVersion,
  addFinalReportData: addFinalReportData,
  getFinalReportData: getFinalReportData,
  getFinalReportDataByDoctor: getFinalReportDataByDoctor,
};
