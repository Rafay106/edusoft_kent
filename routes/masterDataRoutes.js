const router = require("express").Router();
const MD = require("../controllers/masterDataControllers");

router.route("/location").get(MD.getLocations).post(MD.addLocation);

router
  .route("/location/:id")
  .get(MD.getLocation)
  .patch(MD.updateLocation)
  .delete(MD.deleteLocation);

router.route("/company").get(MD.getCompanies).post(MD.addCompany);

router
  .route("/company/:id")
  .get(MD.getCompany)
  .patch(MD.updateCompany)
  .delete(MD.deleteCompany);

router.route("/department").get(MD.getDepartments).post(MD.addDepartment);

router
  .route("/department/:id")
  .get(MD.getDepartment)
  .patch(MD.updateDepartment)
  .delete(MD.deleteDepartment);

router.route("/designation").get(MD.getDesignations).post(MD.addDesignation);

router
  .route("/designation/:id")
  .get(MD.getDesignation)
  .patch(MD.updateDesignation)
  .delete(MD.deleteDesignation);

module.exports = router;
