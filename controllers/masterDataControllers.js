const asyncHandler = require("express-async-handler");
const validator = require("validator");
const {
  Location,
  Company,
  Department,
  Designation,
} = require("../models/masterDataModels");
const {
  createSearchQuery,
  paginatedQuery,
  removeDuplicateFromArray,
} = require("../utils/fn_common");

const ERROR = require("../constants/errorConstants");

/************
 * Location *
 ************/

// @desc    Get users locations paginated
// @route   GET /master-data/location
// @access  Private
const getLocations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.rows) || 10;
  const sort = req.query.sort || "username";
  const searchField = req.query["search-field"];
  const searchValue = req.query["search-value"];

  const query = { admin: req.user._id };

  if (searchField && searchValue) {
    if (searchField === "all") {
      const fields = [
        "name",
        "address1",
        "city",
        "state",
        "country",
        "pincode",
        "range",
      ];

      const searchQuery = createSearchQuery(fields, searchValue);
      query["$or"] = searchQuery["$or"];
    } else {
      const searchQuery = createSearchQuery([searchField], searchValue);
      query["$or"] = searchQuery["$or"];
    }
  }

  const select = {
    active: 1,
    name: 1,
    city: 1,
    state: 1,
    country: 1,
  };

  const results = await paginatedQuery(
    Location,
    query,
    select,
    page,
    limit,
    sort
  );

  res.status(200).json(results);
});

// @desc    Get a location
// @route   GET /master-data/location/:id
// @access  Private
const getLocation = asyncHandler(async (req, res) => {
  const location = await Location.findOne({
    admin: req.user._id,
    _id: req.params.id,
  });

  if (!location) {
    res.status(404);
    throw new Error(ERROR.NF_ID.LOCATION.replace("%id%", req.params.id));
  }

  res.status(200).json(location);
});

// @desc    Add a location
// @route   POST /master-data/location
// @access  Private
const addLocation = asyncHandler(async (req, res) => {
  const { name, address1, address2, city, state } = req.body;
  const { country, pincode, lat, lon, range } = req.body;

  const location = await Location.create({
    admin: req.user._id,
    name,
    address1,
    address2,
    city,
    state,
    country,
    pincode,
    lat,
    lon,
    range,
  });

  res.status(201).json({ msg: location._id, success: true });
});

// @desc    Update a location
// @route   PATCH /master-data/location/:id
// @access  Private
const updateLocation = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  if (!(await Location.exists({ _id, admin: req.user._id }))) {
    res.status(404);
    throw new Error(ERROR.NF_ID.LOCATION.replace("%id%", _id));
  }

  await Location.updateOne(
    { _id, admin: req.user._id },
    {
      $set: {
        active: req.body.active,
        name: req.body.name,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode,
        lat: req.body.lat,
        lon: req.body.lon,
        range: req.body.range,
      },
    }
  );

  res.status(200).json({ success: true });
});

// @desc    Delete a location
// @route   DELETE /master-data/location/:id
// @access  Private
const deleteLocation = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  if (!(await Location.exists({ _id, admin: req.user._id }))) {
    res.status(404);
    throw new Error(ERROR.NF_ID.LOCATION.replace("%id%", _id));
  }

  await Location.deleteOne({ _id });

  res.status(200).json({ success: true });
});

/***********
 * Company *
 ***********/

// @desc    Get list of companies paginated
// @route   GET /master-data/company
// @access  Private
const getCompanies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.rows) || 10;
  const sort = req.query.sort || "username";
  const searchField = req.query["search-field"];
  const searchValue = req.query["search-value"];

  const query = { admin: req.user._id };

  if (searchField && searchValue) {
    if (searchField === "all") {
      const fields = [
        "name",
        "email",
        "phone",
        "address1",
        "address2",
        "city",
        "state",
        "country",
        "pincode",
      ];

      const searchQuery = createSearchQuery(fields, searchValue);
      query["$or"] = searchQuery["$or"];
    } else {
      const searchQuery = createSearchQuery([searchField], searchValue);
      query["$or"] = searchQuery["$or"];
    }
  }

  const select = {
    name: 1,
    city: 1,
    state: 1,
    country: 1,
    active: 1,
  };

  const results = await paginatedQuery(
    Company,
    query,
    select,
    page,
    limit,
    sort
  );

  res.status(200).json(results);
});

// @desc    Get a company
// @route   GET /master-data/company/:id
// @access  Private
const getCompany = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const company = await Company.findOne({ admin: req.user._id, _id })
    .populate("locations", "name lat lon range")
    .lean();

  if (!company) {
    res.status(404);
    throw new Error(ERROR.NF_ID.COMPANY.replace("%id%", _id));
  }

  res.json(company);
});

// @desc    Add a company
// @route   POST /master-data/company
// @access  Private
const addCompany = asyncHandler(async (req, res) => {
  const { name, email, phone, address1, address2 } = req.body;
  const { country, state, city, pincode } = req.body;
  let locations = req.body.locations;

  if (email && !validator.isEmail(email)) {
    res.status(400);
    throw new Error(ERROR.EMAIL_INVALID);
  }

  if (!locations || locations.length === 0) {
    res.status(400);
    throw new Error(ERROR.IR.LOCATION);
  }

  locations = removeDuplicateFromArray(locations);

  for (const _id of locations) {
    if (!(await Location.exists({ _id, admin: req.user._id }))) {
      res.status(400);
      throw new Error(ERROR.NF_ID.LOCATION.replace("%id%", _id));
    }
  }

  const company = await Company.create({
    admin: req.user._id,
    name,
    locations,
    email,
    phone,
    address1,
    address2,
    country,
    state,
    city,
    pincode,
  });

  res.status(201).json({ msg: company._id, success: true });
});

// @desc    Update a company
// @route   PATCH /master-data/company/:id
// @access  Private
const updateCompany = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  if (!(await Company.exists({ _id, admin: req.user._id }))) {
    res.status(404);
    throw new Error(ERROR.NF_ID.COMPANY.replace("%id%", _id));
  }

  const email = req.body.email;
  let locations = req.body.locations;

  if (locations) {
    if (locations.length === 0) {
      locations = undefined;
    } else {
      for (const _id of locations) {
        if (!(await Location.exists({ _id }))) {
          res.status(400);
          throw new Error(ERROR.NF_ID.LOCATION.replace("%id%", _id));
        }
      }
    }
  }

  if (email && !validator.isEmail(email)) {
    res.status(400);
    throw new Error(ERROR.EMAIL_INVALID);
  }

  await Company.updateOne(
    { _id, admin: req.user._id },
    {
      $set: {
        active: req.body.active,
        name: req.body.name,
        locations,
        email,
        phone: req.body.phone,
        address1: req.body.address1,
        address2: req.body.address2,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
      },
    }
  );

  res.status(200).json({ success: true });
});

// @desc    Delete a company
// @route   DELETE /master-data/company/:id
// @access  Private
const deleteCompany = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  if (!(await Company.exists({ _id, admin: req.user._id }))) {
    res.status(404);
    throw new Error(ERROR.NF_ID.COMPANY.replace("%id%", _id));
  }

  await Company.deleteOne({ _id });

  res.status(200).json({ success: true });
});

/**************
 * Department *
 **************/

// @desc    Get list of companies paginated
// @route   GET /master-data/department
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.rows) || 10;
  const sort = req.query.sort || "username";
  const searchField = req.query["search-field"];
  const searchValue = req.query["search-value"];

  const query = { admin: req.user._id };

  if (searchField && searchValue) {
    if (searchField === "all") {
      const fields = ["name"];

      const searchQuery = createSearchQuery(fields, searchValue);
      query["$or"] = searchQuery["$or"];
    } else {
      const searchQuery = createSearchQuery([searchField], searchValue);
      query["$or"] = searchQuery["$or"];
    }
  }

  const select = {
    active: 1,
    name: 1,
    company: 1,
  };

  const results = await paginatedQuery(
    Department,
    query,
    select,
    page,
    limit,
    sort
  );

  const companies = {};

  for (const department of results.result) {
    if (!companies[department.company]) {
      const company = await Company.findById(department.company)
        .select("name")
        .lean();

      companies[department.company] = company.name;
    }

    department.company = companies[department.company];
  }

  res.status(200).json(results);
});

// @desc    Get a department
// @route   GET /master-data/department/:id
// @access  Private
const getDepartment = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const department = await Department.findOne({ _id, admin: req.user._id })
    .populate("company", "name")
    .lean();

  res.json(department);
});

// @desc    Add a department
// @route   POST /master-data/department
// @access  Private
const addDepartment = asyncHandler(async (req, res) => {
  const name = req.body.name;
  let companies = req.body.companies;

  if (!companies || companies.length === 0) {
    res.status(400);
    throw new Error(ERROR.IR.COMPANY);
  }

  companies = removeDuplicateFromArray(companies);

  for (const _id of companies) {
    if (!(await Company.exists({ _id, admin: req.user._id }))) {
      res.status(400);
      throw new Error(ERROR.NF_ID.COMPANY.replace("%id%", _id));
    }
  }

  const results = [];

  for (const company of companies) {
    const department = await Department.create({
      admin: req.user._id,
      name,
      company,
    });

    results.push(department._id);
  }

  res.status(201).json({ msg: results.toString(), success: true });
});

// @desc    Update a department
// @route   PATCH /master-data/department/:id
// @access  Private
const updateDepartment = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const admin = req.user._id;

  if (!(await Department.exists({ _id, admin }))) {
    res.status(404);
    throw new Error(ERROR.NF_ID.DEPARTMENT.replace("%id%", _id));
  }

  const { company } = req.body;

  if (company) {
    if (!(await Company.exists({ _id: company, admin }))) {
      res.status(400);
      throw new Error(ERROR.NF_ID.COMPANY.replace("%id%", _id));
    }
  }

  await Department.updateOne(
    { _id: req.params.id, admin },
    {
      $set: {
        active: req.body.active,
        company,
        name: req.body.name,
      },
    }
  );

  res.json({ success: true });
});

// @desc    Delete a department
// @route   DELETE /master-data/department/:id
// @access  Private
const deleteDepartment = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const admin = req.user._id;

  if (!(await Department.exists({ _id, admin }))) {
    res.status(404);
    throw new Error(ERROR.NF_ID.DEPARTMENT.replace("%id%", _id));
  }

  await Department.deleteOne({ _id, admin });

  res.status(200).json({ success: true });
});

/***************
 * Designation *
 ***************/

// @desc    Get list of designations paginated
// @route   GET /master-data/designation
// @access  Private
const getDesignations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.rows) || 10;
  const sort = req.query.sort || "username";
  const searchField = req.query["search-field"];
  const searchValue = req.query["search-value"];

  const query = { admin: req.user._id };

  if (searchField && searchValue) {
    if (searchField === "all") {
      const fields = ["name"];

      const searchQuery = createSearchQuery(fields, searchValue);
      query["$or"] = searchQuery["$or"];
    } else {
      const searchQuery = createSearchQuery([searchField], searchValue);
      query["$or"] = searchQuery["$or"];
    }
  }

  const select = {
    active: 1,
    name: 1,
    company: 1,
  };

  const results = await paginatedQuery(
    Designation,
    query,
    select,
    page,
    limit,
    sort
  );

  const companies = {};

  for (const designation of results.result) {
    if (!companies[designation.company]) {
      const company = await Company.findById(designation.company)
        .select("name")
        .lean();

      companies[designation.company] = company.name;
    }

    designation.company = companies[designation.company];
  }

  res.status(200).json(results);
});

// @desc    Get a designation
// @route   GET /master-data/designation/:id
// @access  Private
const getDesignation = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const designation = await Designation.findOne({ _id, admin: req.user._id })
    .populate("company", "name")
    .lean();

  res.json(designation);
});

// @desc    Add a designation
// @route   POST /master-data/designation
// @access  Private
const addDesignation = asyncHandler(async (req, res) => {
  const name = req.body.name;
  let companies = req.body.companies;

  if (!companies || companies.length === 0) {
    res.status(400);
    throw new Error(ERROR.IR.COMPANY);
  }

  companies = removeDuplicateFromArray(companies);

  for (const _id of companies) {
    if (!(await Company.exists({ _id, admin: req.user._id }))) {
      res.status(400);
      throw new Error(ERROR.NF_ID.COMPANY.replace("%id%", _id));
    }
  }

  const results = [];

  for (const company of companies) {
    const designation = await Designation.create({
      admin: req.user._id,
      name,
      company,
    });

    results.push(designation._id);
  }

  res.status(201).json({ msg: results.toString(), success: true });
});

// @desc    Update a designation
// @route   PATCH /master-data/designation/:id
// @access  Private
const updateDesignation = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const admin = req.user._id;

  if (!(await Designation.exists({ _id, admin }))) {
    res.status(404);
    throw new Error(ERROR.NF_ID.DEPARTMENT.replace("%id%", _id));
  }

  const { company } = req.body;

  if (company) {
    if (!(await Company.exists({ _id: company, admin }))) {
      res.status(400);
      throw new Error(ERROR.NF_ID.COMPANY.replace("%id%", _id));
    }
  }

  await Designation.updateOne(
    { _id: req.params.id, admin },
    {
      $set: {
        active: req.body.active,
        company,
        name: req.body.name,
      },
    }
  );

  res.json({ success: true });
});

// @desc    Delete a designation
// @route   DELETE /master-data/designation/:id
// @access  Private
const deleteDesignation = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const admin = req.user._id;

  if (!(await Designation.exists({ _id, admin }))) {
    res.status(404);
    throw new Error(ERROR.NF_ID.DEPARTMENT.replace("%id%", _id));
  }

  await Designation.deleteOne({ _id, admin });

  res.status(200).json({ success: true });
});

module.exports = {
  getLocations,
  getLocation,
  addLocation,
  updateLocation,
  deleteLocation,

  getCompanies,
  getCompany,
  addCompany,
  updateCompany,
  deleteCompany,

  getDepartments,
  getDepartment,
  addDepartment,
  updateDepartment,
  deleteDepartment,

  getDesignations,
  getDesignation,
  addDesignation,
  updateDesignation,
  deleteDesignation,
};
