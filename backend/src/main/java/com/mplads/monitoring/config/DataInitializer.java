package com.mplads.monitoring.config;

import com.mplads.monitoring.entity.*;
import com.mplads.monitoring.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final ConstituencyRepository constituencyRepository;
    private final ProjectCategoryRepository categoryRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSummaryRepository projectSummaryRepository;
    private final SanctionRepository sanctionRepository;
    private final FundReleaseRepository fundReleaseRepository;
    private final ExpenditureRepository expenditureRepository;
    private final PaymentRepository paymentRepository;
    private final ProjectProgressRepository progressRepository;
    private final DocumentRepository documentRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final InvestigationRepository investigationRepository;
    private final InvestigationNoteRepository investigationNoteRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing MPLADS system seed data & relational project database...");

        // 1. Initialize Roles
        Role ministryAdminRole = createRoleIfNotFound(RoleName.ROLE_MINISTRY_ADMIN, "Ministry of Statistics & Programme Implementation Administrator");
        Role stateNodalRole = createRoleIfNotFound(RoleName.ROLE_STATE_NODAL_AUTHORITY, "State Nodal Department Authority");
        Role districtAuthRole = createRoleIfNotFound(RoleName.ROLE_DISTRICT_AUTHORITY, "District Magistrate / Deputy Commissioner Authority");
        Role mpRole = createRoleIfNotFound(RoleName.ROLE_MP, "Member of Parliament (Lok Sabha / Rajya Sabha)");

        // 2. Initialize States
        State maharashtra = createStateIfNotFound("MH", "Maharashtra", 480.0, 412.5, 920);
        State uttarPradesh = createStateIfNotFound("UP", "Uttar Pradesh", 640.0, 528.0, 1280);
        State karnataka = createStateIfNotFound("KA", "Karnataka", 320.0, 275.4, 640);
        State tamilNadu = createStateIfNotFound("TN", "Tamil Nadu", 390.0, 345.0, 780);
        State gujarat = createStateIfNotFound("GJ", "Gujarat", 260.0, 228.0, 520);
        State rajasthan = createStateIfNotFound("RJ", "Rajasthan", 250.0, 210.0, 500);
        State bihar = createStateIfNotFound("BR", "Bihar", 400.0, 310.0, 800);
        State westBengal = createStateIfNotFound("WB", "West Bengal", 420.0, 350.0, 840);
        State madhyaPradesh = createStateIfNotFound("MP", "Madhya Pradesh", 290.0, 235.0, 580);
        State kerala = createStateIfNotFound("KL", "Kerala", 200.0, 182.0, 400);
        State delhi = createStateIfNotFound("DL", "NCT of Delhi", 70.0, 62.5, 140);
        State telangana = createStateIfNotFound("TS", "Telangana", 170.0, 148.0, 340);
        State andhraPradesh = createStateIfNotFound("AP", "Andhra Pradesh", 250.0, 218.0, 500);
        State odisha = createStateIfNotFound("OD", "Odisha", 210.0, 178.0, 420);
        State assam = createStateIfNotFound("AS", "Assam", 140.0, 115.0, 280);

        // 3. Initialize Districts
        District pune = createDistrictIfNotFound("MH-PUN", "Pune", maharashtra, "Pune City");
        District nagpur = createDistrictIfNotFound("MH-NAG", "Nagpur", maharashtra, "Nagpur");
        District varanasi = createDistrictIfNotFound("UP-VAR", "Varanasi", uttarPradesh, "Varanasi");
        District lucknow = createDistrictIfNotFound("UP-LKO", "Lucknow", uttarPradesh, "Lucknow");
        District bengaluruUrban = createDistrictIfNotFound("KA-BLR", "Bengaluru Urban", karnataka, "Bengaluru");
        District chennai = createDistrictIfNotFound("TN-CHN", "Chennai", tamilNadu, "Chennai");
        District ahmedabad = createDistrictIfNotFound("GJ-AHM", "Ahmedabad", gujarat, "Ahmedabad");

        // 4. Initialize Constituencies
        Constituency punePc = createConstituencyIfNotFound("PC-MH-34", "Pune", pune, "Lok Sabha", "Shri Murlidhar Mohol");
        Constituency baramatiPc = createConstituencyIfNotFound("PC-MH-35", "Baramati", pune, "Lok Sabha", "Smt. Supriya Sule");
        Constituency varanasiPc = createConstituencyIfNotFound("PC-UP-77", "Varanasi", varanasi, "Lok Sabha", "Shri Narendra Modi");
        Constituency lucknowPc = createConstituencyIfNotFound("PC-UP-35", "Lucknow", lucknow, "Lok Sabha", "Shri Rajnath Singh");
        Constituency bangaloreSouthPc = createConstituencyIfNotFound("PC-KA-26", "Bangalore South", bengaluruUrban, "Lok Sabha", "Shri Tejasvi Surya");

        // 5. Initialize Project Categories
        ProjectCategory catWater = createCategoryIfNotFound("DRINKING_WATER", "Drinking Water", "Community RO plants, pipelines, borewells");
        ProjectCategory catEdu = createCategoryIfNotFound("EDUCATION", "Education", "Smart classrooms, school laboratories, digital libraries");
        ProjectCategory catHealth = createCategoryIfNotFound("HEALTHCARE", "Healthcare", "Primary healthcare centers, diagnostic equipment, ambulances");
        ProjectCategory catRoads = createCategoryIfNotFound("ROADS_BRIDGES", "Roads & Bridges", "Rural concrete roads, culverts, pedestrian pathways");
        ProjectCategory catSanitation = createCategoryIfNotFound("SANITATION_UTILITIES", "Sanitation & Public Utilities", "Community toilets, solar street lighting, waste disposal");
        ProjectCategory catInfra = createCategoryIfNotFound("RURAL_INFRA", "Rural Infrastructure", "Community halls, youth skill centers, agrimarkets");

        // 6. Initialize Seed Users
        User adminUser = createUserIfNotFound(
                "ministry.admin@gov.in",
                "Admin@123456",
                "Dr. Rajesh Verma, IAS",
                "9876543210",
                ministryAdminRole,
                null,
                null,
                null,
                "Ministry of Statistics & Programme Implementation",
                "Joint Secretary (MPLADS)"
        );

        User stateMhUser = createUserIfNotFound(
                "state.mh@gov.in",
                "State@123456",
                "Smt. Ananya Deshmukh",
                "9811223344",
                stateNodalRole,
                maharashtra,
                null,
                null,
                "Planning Department, Govt of Maharashtra",
                "State Nodal Officer"
        );

        User stateUpUser = createUserIfNotFound(
                "state.up@gov.in",
                "State@123456",
                "Shri Arvind Srivastava",
                "9822334455",
                stateNodalRole,
                uttarPradesh,
                null,
                null,
                "Planning Department, Govt of Uttar Pradesh",
                "Joint Director & State Nodal Officer"
        );

        User distPuneUser = createUserIfNotFound(
                "district.pune@gov.in",
                "District@123456",
                "Dr. Suhas Diwase, IAS",
                "9833445566",
                districtAuthRole,
                maharashtra,
                pune,
                null,
                "District Collectorate Pune",
                "District Magistrate & Collector"
        );

        User distVarUser = createUserIfNotFound(
                "district.varanasi@gov.in",
                "District@123456",
                "Shri S. Rajalingam, IAS",
                "9844556677",
                districtAuthRole,
                uttarPradesh,
                varanasi,
                null,
                "District Collectorate Varanasi",
                "District Magistrate & Collector"
        );

        User mpPuneUser = createUserIfNotFound(
                "mp.pune@sansad.nic.in",
                "Mp@123456",
                "Hon. Member of Parliament (Pune)",
                "9855667788",
                mpRole,
                maharashtra,
                pune,
                punePc,
                "Parliament of India (Lok Sabha)",
                "Member of Parliament"
        );

        User mpVarUser = createUserIfNotFound(
                "mp.varanasi@sansad.nic.in",
                "Mp@123456",
                "Hon. Member of Parliament (Varanasi)",
                "9866778899",
                mpRole,
                uttarPradesh,
                varanasi,
                varanasiPc,
                "Parliament of India (Lok Sabha)",
                "Member of Parliament"
        );

        // 7. Initialize Master Projects & Relational Artifacts
        initMasterProjects(
                maharashtra, pune, punePc, mpPuneUser,
                uttarPradesh, varanasi, varanasiPc, mpVarUser,
                karnataka, bengaluruUrban, bangaloreSouthPc,
                catWater, catEdu, catHealth, catRoads, catSanitation, catInfra
        );

        // 8. Initialize Audit Log
        if (auditLogRepository.count() == 0) {
            auditLogRepository.save(AuditLog.builder()
                    .action("SYSTEM_INITIALIZATION")
                    .performedBy("SYSTEM_BOOTSTRAP")
                    .userRole("ROLE_MINISTRY_ADMIN")
                    .details("MPLADS Monitoring Platform relational schema initialized with master projects, sanctions, fund releases, and GIS locations.")
                    .ipAddress("127.0.0.1")
                    .status("SUCCESS")
                    .build());
        }

        log.info("MPLADS seed data initialization completed successfully.");
    }

    private void initMasterProjects(
            State mh, District pune, Constituency punePc, User mpPune,
            State up, District varanasi, Constituency varanasiPc, User mpVar,
            State ka, District blr, Constituency blrPc,
            ProjectCategory catWater, ProjectCategory catEdu, ProjectCategory catHealth,
            ProjectCategory catRoads, ProjectCategory catSanitation, ProjectCategory catInfra
    ) {
        if (projectRepository.count() > 0) return;

        // Project 1: Pune Completed Drinking Water
        Project p1 = Project.builder()
                .projectId("MPLADS-MH-PUN-2024-001")
                .projectName("Construction of Solar-Powered RO Drinking Water Plants in 12 Rural Schools")
                .description("Installation of high-capacity solar powered reverse osmosis filtration units across government secondary schools in Haveli taluka.")
                .state(mh).district(pune).constituency(punePc).mpUser(mpPune).mpName("Shri Murlidhar Mohol")
                .implementingAgency("Zilla Parishad Pune (Rural Water Supply)")
                .category(catWater).categoryName(catWater.getName())
                .sanctionedAmount(45.0)
                .releasedAmount(45.0)
                .expenditureAmount(45.0)
                .startDate(LocalDate.now().minusMonths(14))
                .expectedCompletionDate(LocalDate.now().minusMonths(2))
                .actualCompletionDate(LocalDate.now().minusMonths(2))
                .physicalProgress(100)
                .financialProgress(100.0)
                .status(ProjectStatus.COMPLETED)
                .riskLevel("LOW")
                .riskScore(8.5)
                .riskReason("Successfully commissioned with third-party water purity certification.")
                .latitude(18.5204)
                .longitude(73.8567)
                .delayDays(0)
                .build();
        projectRepository.save(p1);
        seedFinancialsAndProgress(p1, 45.0, 45.0, 45.0, 100, 0, false, "RO units installed and commissioned.");

        // Project 2: Pune Ongoing Smart Classrooms
        Project p2 = Project.builder()
                .projectId("MPLADS-MH-PUN-2024-002")
                .projectName("Modern Smart Classrooms & Digital Science Laboratory at Model Govt High School")
                .description("Equipping 8 model schools with interactive smart panels, computerized science experiment kits, and broadband learning hubs.")
                .state(mh).district(pune).constituency(punePc).mpUser(mpPune).mpName("Shri Murlidhar Mohol")
                .implementingAgency("Public Works Department (Building Division), Pune")
                .category(catEdu).categoryName(catEdu.getName())
                .sanctionedAmount(60.0)
                .releasedAmount(45.0)
                .expenditureAmount(42.0)
                .startDate(LocalDate.now().minusMonths(8))
                .expectedCompletionDate(LocalDate.now().plusMonths(3))
                .physicalProgress(75)
                .financialProgress(70.0)
                .status(ProjectStatus.ONGOING)
                .riskLevel("LOW")
                .riskScore(14.0)
                .riskReason("Civil renovation 90% complete; hardware procurement in progress.")
                .latitude(18.5314)
                .longitude(73.8446)
                .delayDays(0)
                .build();
        projectRepository.save(p2);
        seedFinancialsAndProgress(p2, 60.0, 45.0, 42.0, 75, 0, false, "Hardware cabling and smart panels installed.");

        // Project 3: Pune High Risk Delayed Road
        Project p3 = Project.builder()
                .projectId("MPLADS-MH-PUN-2024-003")
                .projectName("Rural Concrete Connectivity Road connecting Velhe to Ketkawle")
                .description("Construction of 4.2 km heavy duty cement concrete link road with reinforced side drainages and cross-culverts.")
                .state(mh).district(pune).constituency(punePc).mpUser(mpPune).mpName("Shri Murlidhar Mohol")
                .implementingAgency("Rural Development Agency, Pune")
                .category(catRoads).categoryName(catRoads.getName())
                .sanctionedAmount(85.0)
                .releasedAmount(72.0)
                .expenditureAmount(70.0)
                .startDate(LocalDate.now().minusMonths(14))
                .expectedCompletionDate(LocalDate.now().minusMonths(2))
                .physicalProgress(35)
                .financialProgress(82.3)
                .status(ProjectStatus.DELAYED)
                .riskLevel("HIGH")
                .riskScore(84.0)
                .riskReason("Critical Anomaly: 82% funds disbursed but physical road progress is only 35%. Milestone overdue by 60+ days.")
                .latitude(18.2917)
                .longitude(73.6339)
                .delayDays(62)
                .build();
        projectRepository.save(p3);
        seedFinancialsAndProgress(p3, 85.0, 72.0, 70.0, 35, 62, true, "Sub-base leveling stalled due to contractor machinery shortage.");
        seedAlertAndInvestigation(p3, "PROGRESS_FINANCIAL_MISMATCH", "HIGH", "Disproportionate Fund Drawdown Flagged",
                "82.3% of sanctioned capital disbursed with only 35% physical completion. Site inspection required.");

        // Project 4: Pune Solar Street Lights Ongoing
        Project p4 = Project.builder()
                .projectId("MPLADS-MH-PUN-2024-004")
                .projectName("Installation of 150 LED High-Mast Solar Street Lights in Peri-Urban Wards")
                .description("Energy efficient standalone solar illumination poles with lithium ferro-phosphate battery backup across 14 municipal wards.")
                .state(mh).district(pune).constituency(punePc).mpUser(mpPune).mpName("Shri Murlidhar Mohol")
                .implementingAgency("MSEDCL / Municipal Council")
                .category(catSanitation).categoryName(catSanitation.getName())
                .sanctionedAmount(30.0)
                .releasedAmount(20.0)
                .expenditureAmount(12.0)
                .startDate(LocalDate.now().minusMonths(5))
                .expectedCompletionDate(LocalDate.now().plusMonths(2))
                .physicalProgress(40)
                .financialProgress(40.0)
                .status(ProjectStatus.ONGOING)
                .riskLevel("MODERATE")
                .riskScore(38.0)
                .riskReason("Moderate timeline risk: Battery shipments delayed by supplier.")
                .latitude(18.5912)
                .longitude(73.7389)
                .delayDays(0)
                .build();
        projectRepository.save(p4);
        seedFinancialsAndProgress(p4, 30.0, 20.0, 12.0, 40, 0, false, "Poles erected; awaiting battery shipment.");

        // Project 5: Varanasi Completed Primary Health
        Project p5 = Project.builder()
                .projectId("MPLADS-UP-VAR-2024-001")
                .projectName("Establishment of Telemedicine & Primary Health Diagnostic Unit at Sevapuri")
                .description("Equipping primary health center with advanced digital pathology analyzer, automated ECG, ultrasound scanner, and satellite telemedicine.")
                .state(up).district(varanasi).constituency(varanasiPc).mpUser(mpVar).mpName("Shri Narendra Modi")
                .implementingAgency("Chief Medical Office Varanasi")
                .category(catHealth).categoryName(catHealth.getName())
                .sanctionedAmount(95.0)
                .releasedAmount(95.0)
                .expenditureAmount(95.0)
                .startDate(LocalDate.now().minusMonths(11))
                .expectedCompletionDate(LocalDate.now().minusMonths(1))
                .actualCompletionDate(LocalDate.now().minusMonths(1))
                .physicalProgress(100)
                .financialProgress(100.0)
                .status(ProjectStatus.COMPLETED)
                .riskLevel("LOW")
                .riskScore(6.0)
                .riskReason("Fully operational and serving 200+ rural outpatients daily.")
                .latitude(25.3176)
                .longitude(82.9739)
                .delayDays(0)
                .build();
        projectRepository.save(p5);
        seedFinancialsAndProgress(p5, 95.0, 95.0, 95.0, 100, 0, false, "Diagnostic machinery commissioned and staff trained.");

        // Project 6: Varanasi Ongoing Community Center
        Project p6 = Project.builder()
                .projectId("MPLADS-UP-VAR-2024-002")
                .projectName("Construction of Multi-Purpose Community Center and Skill Hall at Kashi")
                .description("Two-storey community skill building with 350-seater auditorium, women self-help group training workshop, and rooftop solar array.")
                .state(up).district(varanasi).constituency(varanasiPc).mpUser(mpVar).mpName("Shri Narendra Modi")
                .implementingAgency("UP Project Corporation Ltd.")
                .category(catInfra).categoryName(catInfra.getName())
                .sanctionedAmount(120.0)
                .releasedAmount(90.0)
                .expenditureAmount(80.0)
                .startDate(LocalDate.now().minusMonths(7))
                .expectedCompletionDate(LocalDate.now().plusMonths(4))
                .physicalProgress(65)
                .financialProgress(66.6)
                .status(ProjectStatus.ONGOING)
                .riskLevel("LOW")
                .riskScore(12.0)
                .riskReason("Structural slab work complete; interior plastering and wiring active.")
                .latitude(25.3356)
                .longitude(83.0076)
                .delayDays(0)
                .build();
        projectRepository.save(p6);
        seedFinancialsAndProgress(p6, 120.0, 90.0, 80.0, 65, 0, false, "First floor slab cast; electrical conduits laid.");

        // Project 7: Varanasi Anomaly Flagged Water Pipeline
        Project p7 = Project.builder()
                .projectId("MPLADS-UP-VAR-2024-003")
                .projectName("Deep Tube-well Water Distribution Pipeline in Rohania Block")
                .description("Laying of 8.5 km feeder pipeline and overhead reservoir for safe potable supply across 6 habitations.")
                .state(up).district(varanasi).constituency(varanasiPc).mpUser(mpVar).mpName("Shri Narendra Modi")
                .implementingAgency("UP Jal Nigam (Rural)")
                .category(catWater).categoryName(catWater.getName())
                .sanctionedAmount(55.0)
                .releasedAmount(50.0)
                .expenditureAmount(50.0)
                .startDate(LocalDate.now().minusMonths(9))
                .expectedCompletionDate(LocalDate.now().minusMonths(2))
                .physicalProgress(20)
                .financialProgress(90.9)
                .status(ProjectStatus.DELAYED)
                .riskLevel("ANOMALY_FLAGGED")
                .riskScore(92.0)
                .riskReason("Rapid payment draw-down: 91% funds spent within 30 days while pipe laying physically verified at only 20%. Field audit recommended.")
                .latitude(25.2677)
                .longitude(82.9122)
                .delayDays(65)
                .build();
        projectRepository.save(p7);
        seedFinancialsAndProgress(p7, 55.0, 50.0, 50.0, 20, 65, true, "Trenching completed for 1.8km; pipes delivered to storage yard.");
        seedAlertAndInvestigation(p7, "PAYMENT_ANOMALY", "CRITICAL", "Rapid Fund Drawdown without Milestone Delivery",
                "Full contract advance cleared without physical progress verification certificate.");

        // Project 8: Bangalore Digital Library
        Project p8 = Project.builder()
                .projectId("MPLADS-KA-BLR-2024-001")
                .projectName("Digital Library & Skill Training Resource Hub for Youth")
                .description("Public digital learning center with 60 high-speed computer terminals, competitive examination preparation software, and assistive reading tech.")
                .state(ka).district(blr).constituency(blrPc).mpName("Shri Tejasvi Surya")
                .implementingAgency("BBMP Education Infrastructure Cell")
                .category(catEdu).categoryName(catEdu.getName())
                .sanctionedAmount(75.0)
                .releasedAmount(75.0)
                .expenditureAmount(75.0)
                .startDate(LocalDate.now().minusMonths(10))
                .expectedCompletionDate(LocalDate.now().minusMonths(3))
                .actualCompletionDate(LocalDate.now().minusMonths(3))
                .physicalProgress(100)
                .financialProgress(100.0)
                .status(ProjectStatus.COMPLETED)
                .riskLevel("LOW")
                .riskScore(5.0)
                .riskReason("High public utility rating; 450+ daily active student visits.")
                .latitude(12.9716)
                .longitude(77.5946)
                .delayDays(0)
                .build();
        projectRepository.save(p8);
        seedFinancialsAndProgress(p8, 75.0, 75.0, 75.0, 100, 0, false, "Center commissioned with full LAN and 100 Mbps fiber.");
    }

    private void seedFinancialsAndProgress(
            Project p, double sanctioned, double released, double expenditure,
            int physicalProg, int delayDays, boolean isDelayed, String stageNote
    ) {
        // Sanction
        Sanction s = Sanction.builder()
                .project(p)
                .sanctionOrderNumber("SO-" + p.getProjectId() + "-01")
                .sanctionDate(p.getStartDate() != null ? p.getStartDate() : LocalDate.now().minusMonths(6))
                .sanctionedAmount(sanctioned)
                .sanctioningAuthority("District Authority / District Magistrate")
                .workOrderNumber("WO-PUN-" + (1000 + p.getId()))
                .remarks("Formal administrative approval and technical sanction granted.")
                .build();
        sanctionRepository.save(s);

        // Fund Release
        FundRelease fr1 = FundRelease.builder()
                .project(p)
                .installmentNumber(1)
                .releaseOrderNumber("RO-" + p.getProjectId() + "-INST1")
                .releaseDate(s.getSanctionDate().plusDays(15))
                .releasedAmount(released >= sanctioned ? released * 0.6 : released)
                .disbursedBy("State Nodal Cell")
                .pfmsReference("PFMS-REL-" + (20000 + p.getId()))
                .remarks("Initial milestone mobilization fund release.")
                .build();
        fundReleaseRepository.save(fr1);

        if (released > fr1.getReleasedAmount()) {
            FundRelease fr2 = FundRelease.builder()
                    .project(p)
                    .installmentNumber(2)
                    .releaseOrderNumber("RO-" + p.getProjectId() + "-INST2")
                    .releaseDate(fr1.getReleaseDate().plusMonths(3))
                    .releasedAmount(Math.round((released - fr1.getReleasedAmount()) * 100.0) / 100.0)
                    .disbursedBy("State Nodal Cell")
                    .pfmsReference("PFMS-REL-" + (30000 + p.getId()))
                    .remarks("Second milestone fund installment.")
                    .build();
            fundReleaseRepository.save(fr2);
        }

        // Expenditure
        Expenditure exp = Expenditure.builder()
                .project(p)
                .voucherNumber("VOUCH-" + p.getId() + "-01")
                .expenditureDate(fr1.getReleaseDate().plusMonths(1))
                .amount(expenditure)
                .componentName("Civil Works & Equipment Procurement")
                .vendorName("National Construction & Engineering Consortium")
                .utilizationCertificateNumber("UC-" + p.getProjectId() + "-2024")
                .remarks("Certified expenditure incurred against approved DPR items.")
                .build();
        expenditureRepository.save(exp);

        // Payment
        Payment pay = Payment.builder()
                .project(p)
                .paymentReference("PFMS-TXN-" + (80000 + p.getId()))
                .paymentDate(exp.getExpenditureDate().plusDays(5))
                .amount(expenditure)
                .payeeName(exp.getVendorName())
                .paymentMode("PFMS")
                .paymentStatus("SUCCESS")
                .beneficiaryAccount("SBI-99887766554")
                .remarks("Electronic clearing via PFMS direct treasury gateway.")
                .build();
        paymentRepository.save(pay);

        // Progress Log
        ProjectProgress prog = ProjectProgress.builder()
                .project(p)
                .reportingDate(LocalDate.now().minusDays(10))
                .physicalProgressPercent(physicalProg)
                .financialProgressPercent(Math.min(100.0, Math.round((expenditure / sanctioned * 100.0) * 10.0) / 10.0))
                .stageDescription(stageNote)
                .inspectionNotes("Inspected by Executive Engineer on-site. Measurements recorded in official MB.")
                .reportedBy("Executive Engineer (MPLADS Inspection Cell)")
                .delayDays(delayDays)
                .isDelayed(isDelayed)
                .delayReason(isDelayed ? p.getRiskReason() : null)
                .build();
        progressRepository.save(prog);

        // Documents
        Document doc1 = Document.builder()
                .project(p)
                .documentType("SANCTION_LETTER")
                .fileName("Sanction_Order_" + p.getProjectId() + ".pdf")
                .fileUrl("/documents/sanctions/" + p.getProjectId() + ".pdf")
                .fileSize(1420500L)
                .uploadedBy("District Planning Officer")
                .build();
        Document doc2 = Document.builder()
                .project(p)
                .documentType("UTILIZATION_CERTIFICATE")
                .fileName("Form_GFR12A_UC_" + p.getProjectId() + ".pdf")
                .fileUrl("/documents/uc/" + p.getProjectId() + ".pdf")
                .fileSize(892100L)
                .uploadedBy("Implementing Agency Finance Lead")
                .build();
        documentRepository.saveAll(List.of(doc1, doc2));
    }

    private void seedAlertAndInvestigation(Project p, String alertType, String severity, String title, String desc) {
        RiskAlert alert = RiskAlert.builder()
                .project(p)
                .alertType(alertType)
                .severity(severity)
                .title(title)
                .description(desc)
                .triggerRule("RULE_DISBURSEMENT_PROGRESS_RATIO > 2.0")
                .status("INVESTIGATING")
                .build();
        RiskAlert savedAlert = riskAlertRepository.save(alert);

        Investigation inv = Investigation.builder()
                .project(p)
                .riskAlert(savedAlert)
                .caseNumber("INV-MPLADS-2024-" + (500 + p.getId()))
                .investigatorName("Shri K. Ramanathan, Deputy Director (Audit)")
                .status("IN_PROGRESS")
                .priority("HIGH")
                .assignedDate(LocalDate.now().minusDays(20))
                .findingsSummary("Preliminary inspection confirms foundation work executed. Detailed voucher verification in progress.")
                .build();
        Investigation savedInv = investigationRepository.save(inv);

        InvestigationNote note = InvestigationNote.builder()
                .investigation(savedInv)
                .authorName("Shri K. Ramanathan")
                .authorRole("Auditor")
                .noteText("Notice served to contractor to produce material purchase receipts and site attendance register by next week.")
                .build();
        investigationNoteRepository.save(note);
    }

    private Role createRoleIfNotFound(RoleName roleName, String description) {
        return roleRepository.findByName(roleName).orElseGet(() ->
                roleRepository.save(Role.builder().name(roleName).description(description).build())
        );
    }

    private State createStateIfNotFound(String code, String name, Double sanctionedCr, Double expenditureCr, Integer activeProjects) {
        return stateRepository.findByCode(code).orElseGet(() ->
                stateRepository.save(State.builder()
                        .code(code)
                        .name(name)
                        .totalSanctionedCr(sanctionedCr)
                        .totalExpenditureCr(expenditureCr)
                        .activeProjectsCount(activeProjects)
                        .build())
        );
    }

    private District createDistrictIfNotFound(String code, String name, State state, String hq) {
        return districtRepository.findByCode(code).orElseGet(() ->
                districtRepository.save(District.builder()
                        .code(code)
                        .name(name)
                        .state(state)
                        .headquarters(hq)
                        .build())
        );
    }

    private Constituency createConstituencyIfNotFound(String code, String name, District district, String houseType, String mpName) {
        return constituencyRepository.findByCode(code).orElseGet(() ->
                constituencyRepository.save(Constituency.builder()
                        .code(code)
                        .name(name)
                        .district(district)
                        .houseType(houseType)
                        .mpName(mpName)
                        .build())
        );
    }

    private ProjectCategory createCategoryIfNotFound(String code, String name, String desc) {
        return categoryRepository.findByCode(code).orElseGet(() ->
                categoryRepository.save(ProjectCategory.builder().code(code).name(name).description(desc).build())
        );
    }

    private User createUserIfNotFound(String email, String rawPassword, String fullName, String mobile,
                                      Role role, State state, District district, Constituency constituency,
                                      String organization, String designation) {
        return userRepository.findByEmail(email).map(existing -> {
            boolean updated = false;
            if (existing.getAccountStatus() == null) {
                existing.setAccountStatus(Boolean.TRUE.equals(existing.getIsActive()) ? "ACTIVE" : "PENDING");
                updated = true;
            }
            if (existing.getClearanceStatus() == null) {
                existing.setClearanceStatus(Boolean.TRUE.equals(existing.getIsApproved()) ? "APPROVED" : "PENDING");
                updated = true;
            }
            return updated ? userRepository.save(existing) : existing;
        }).orElseGet(() -> {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .mobileNumber(mobile)
                    .role(role)
                    .state(state)
                    .district(district)
                    .constituency(constituency)
                    .organization(organization)
                    .designation(designation)
                    .isActive(true)
                    .isApproved(true)
                    .accountStatus("ACTIVE")
                    .clearanceStatus("APPROVED")
                    .build();
            return userRepository.save(user);
        });
    }
}
