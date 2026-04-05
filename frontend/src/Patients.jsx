import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner, Table, ListGroup, InputGroup } from "react-bootstrap";
import { SpeakButton } from "./hooks/useElevenLabs.jsx";
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// ---------- [ MongoDB Patient Add & View ] ----------
function MDBPatientsBlock({ apiKey = "dev-key" }) {
  const [fhirPatients, setFhirPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [details, setDetails] = useState(null);
  const [diagForm, setDiagForm] = useState({ earlier_meds: "", current_meds: "", doctor_names: "", hospital_names: "" });
  const [treatItems, setTreatItems] = useState([]);
  const [treatNote, setTreatNote] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [codeDiseaseName, setCodeDiseaseName] = useState("");
  const [savedConditions, setSavedConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", condition: "" });
  const [newPatientForm, setNewPatientForm] = useState({ name: "", condition: "" });

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/saves`, { headers: { "x-api-key": apiKey } });
      if (!res.ok) throw new Error("Failed to load patients");
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      const byPatient = new Map();
      for (const cond of arr) {
        const ref = cond?.subject?.reference || "";
        const pid = typeof ref === "string" && ref.includes("/") ? ref.split("/").pop() : null;
        if (!pid) continue;
        const ts = cond?.meta?.lastUpdated || cond?.recordedDate || cond?.date || cond?._savedAt || null;
        const name = cond?.subject?.display || extractName(cond) || pid;
        const prev = byPatient.get(pid);
        if (!prev || (ts && (!prev.ts || new Date(ts) > new Date(prev.ts)))) {
          byPatient.set(pid, { patientId: pid, name, ts, sample: cond });
        }
      }
      setFhirPatients(Array.from(byPatient.values()));
    } catch (e) {
      setError(e.message || "Error loading patients");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (pid) => {
    if (!pid) return;
    try {
      const res = await fetch(`${API_BASE}/patients/${pid}`);
      let data = null;
      if (res.ok) {
        data = await res.json();
      } else {
        // fallback: compose from diagnosis/treatment only
        const [diagRes, treatRes] = await Promise.all([
          fetch(`${API_BASE}/patients/${pid}/diagnosis`),
          fetch(`${API_BASE}/patients/${pid}/treatment`),
        ]);
        const diagnosis = diagRes.ok ? await diagRes.json() : {};
        const treatment = treatRes.ok ? await treatRes.json() : {};
        data = { patient: { patient_id: pid, name: selectedPatientName }, diagnosis, treatment };
      }
      setDetails(data);
      // prefill forms
      setDiagForm({
        earlier_meds: data?.diagnosis?.earlier_meds || "",
        current_meds: data?.diagnosis?.current_meds || "",
        doctor_names: data?.diagnosis?.doctor_names || "",
        hospital_names: data?.diagnosis?.hospital_names || "",
      });
      setTreatItems(Array.isArray(data?.treatment?.items) ? data.treatment.items : []);
      setTreatNote(data?.treatment?.note || "");
      // prefill edit form
      setEditForm({
        name: data?.patient?.name || selectedPatientName || "",
        condition: data?.patient?.condition || "",
      });
    } catch (e) {
      setDetails(null);
    }
  };

  const fetchSavedConditions = async (pid) => {
    if (!pid) return;
    try {
      const res = await fetch(`${API_BASE}/saves`, { headers: { "x-api-key": apiKey } });
      if (!res.ok) throw new Error("Failed to load saved conditions");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const ref = `Patient/${pid}`;
      const filtered = list.filter((c) => (c?.subject?.reference === ref) || (typeof c?.subject?.reference === 'string' && c.subject.reference.endsWith(pid)));
      setSavedConditions(filtered);
    } catch (e) {
      setSavedConditions([]);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) fetchDetails(selectedPatientId);
    if (selectedPatientId) fetchSavedConditions(selectedPatientId);
  }, [selectedPatientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPatientForm.name, condition: newPatientForm.condition }),
      });
      if (!res.ok) throw new Error("Failed to add patient");
      setNewPatientForm({ name: "", condition: "" });
      fetchPatients();
    } catch (e) {
      setError(e.message || "Error adding patient");
    } finally {
      setLoading(false);
    }
  };

  const saveDiagnosis = async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/patients/${selectedPatientId}/diagnosis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diagForm),
      });
      if (!res.ok) throw new Error("Failed to save diagnosis");
      await fetchDetails(selectedPatientId);
    } catch (e) {
      setError(e.message || "Failed to save diagnosis");
    } finally {
      setLoading(false);
    }
  };

  const addTreatmentItem = () => {
    setTreatItems([...treatItems, { drug: "", dosage: "", time: "", remark: "" }]);
  };
  const updateTreatmentItem = (idx, key, value) => {
    const next = [...treatItems];
    next[idx] = { ...next[idx], [key]: value };
    setTreatItems(next);
  };
  const removeTreatmentItem = (idx) => {
    const next = [...treatItems];
    next.splice(idx, 1);
    setTreatItems(next);
  };
  const saveTreatment = async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/patients/${selectedPatientId}/treatment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: treatItems, note: treatNote }),
      });
      if (!res.ok) throw new Error("Failed to save treatment");
      await fetchDetails(selectedPatientId);
    } catch (e) {
      setError(e.message || "Failed to save treatment");
    } finally {
      setLoading(false);
    }
  };

  const savePatientInfo = async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          patient_id: selectedPatientId, 
          name: editForm.name, 
          condition: editForm.condition 
        }),
      });
      if (!res.ok) throw new Error("Failed to save patient info");
      await fetchDetails(selectedPatientId);
      await fetchPatients(); // Refresh the patient list
      setIsEditing(false);
    } catch (e) {
      setError(e.message || "Failed to save patient info");
    } finally {
      setLoading(false);
    }
  };

  const saveAllChanges = async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    setError("");
    try {
      // Save patient info
      await fetch(`${API_BASE}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          patient_id: selectedPatientId, 
          name: editForm.name, 
          condition: editForm.condition 
        }),
      });
      
      // Save diagnosis
      await fetch(`${API_BASE}/patients/${selectedPatientId}/diagnosis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diagForm),
      });
      
      // Save treatment
      await fetch(`${API_BASE}/patients/${selectedPatientId}/treatment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: treatItems, note: treatNote }),
      });
      
      await fetchDetails(selectedPatientId);
      await fetchPatients(); // Refresh the patient list
      setIsEditing(false);
    } catch (e) {
      setError(e.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex align-items-center">
          <i className="bi bi-database text-primary me-2"></i>
          <h5 className="mb-0"> Patient Management</h5>
        </div>
      </Card.Header>
      <Card.Body>

        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            FHIR Patients
          </h6>
          <Badge bg="primary">{fhirPatients.length}</Badge>
        </div>

        {/* Add New Patient Form */}
        <Form onSubmit={handleSubmit} className="mb-4 p-3 border rounded bg-light">
          <h6 className="fw-semibold mb-3"><i className="bi bi-person-plus me-2"></i>Add New Patient</h6>
          <Row className="g-2 align-items-end">
            <Col md={5}>
              <Form.Label>Patient Name</Form.Label>
              <Form.Control
                value={newPatientForm.name}
                onChange={e => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                placeholder="Enter patient name"
                required
              />
            </Col>
            <Col md={5}>
              <Form.Label>Condition (optional)</Form.Label>
              <Form.Control
                value={newPatientForm.condition}
                onChange={e => setNewPatientForm({ ...newPatientForm, condition: e.target.value })}
                placeholder="e.g. Shwasa"
              />
            </Col>
            <Col md={2}>
              <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                <i className="bi bi-plus-lg me-1"></i>Add
              </Button>
            </Col>
          </Row>
        </Form>

        {fhirPatients.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <p className="text-muted mb-1">No FHIR patients found.</p>
            <small className="text-muted d-block">Tip: Use the Search & Translate tab to create and save a Condition first.</small>
            <small className="text-muted d-block">Also ensure API Key is set and backend is running.</small>
          </div>
        ) : (
          <ListGroup variant="flush">
            {fhirPatients.map((p, i) => (
              <ListGroup.Item
                key={i}
                action
                active={p.patientId === selectedPatientId}
                onClick={() => { setSelectedPatientId(p.patientId); setSelectedPatientName(p.name || ""); }}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong className="text-primary">{p.name}</strong>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPatientId(p.patientId);
                      setSelectedPatientName(p.name || "");
                      setIsEditing(true);
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </Button>
                  <Badge bg="light" text="dark">
                    <i className="bi bi-database me-1"></i>
                    {p.patientId}
                  </Badge>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>

    {/* Details + 3 Dashboards */}
    {selectedPatientId && (
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <i className="bi bi-person-lines-fill text-success me-2"></i>
              <h5 className="mb-0">Patient Dashboard</h5>
            </div>
            <Badge bg="secondary">ID: {selectedPatientId}</Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Enhanced Patient Details - Similar to FHIR Patient Details */}
          <Card className="border-0 bg-light mb-4">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-circle text-primary me-2"></i>
                  <h6 className="mb-0">Patient Details</h6>
                  <Badge bg="primary" className="ms-2">
                    {details?.patient?.patient_id || "MongoDB"}
                  </Badge>
                </div>
                <div className="d-flex gap-2">
                  {!isEditing ? (
                    <Button variant="outline-primary" size="sm" onClick={() => setIsEditing(true)}>
                      <i className="bi bi-pencil me-1"></i>
                      Edit Details
                    </Button>
                  ) : (
                    <>
                      <Button variant="success" size="sm" onClick={saveAllChanges} disabled={loading}>
                        <i className="bi bi-check-lg me-1"></i>
                        Save All
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => setIsEditing(false)}>
                        <i className="bi bi-x-lg me-1"></i>
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="fw-semibold text-muted">Patient ID</label>
                    <p className="mb-0">{details?.patient?.patient_id || selectedPatientId}</p>
                  </div>
                  <div className="mb-3">
                    <label className="fw-semibold text-muted">Patient Name</label>
                    {isEditing ? (
                      <Form.Control
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Enter patient name"
                      />
                    ) : (
                      <p className="mb-0"><strong>{details?.patient?.name || "Unknown"}</strong></p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="fw-semibold text-muted">Condition</label>
                    {isEditing ? (
                      <Form.Control
                        value={editForm.condition}
                        onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                        placeholder="Enter condition"
                      />
                    ) : (
                      <p className="mb-0">{details?.patient?.condition || "Not specified"}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="fw-semibold text-muted">Created</label>
                    <p className="mb-0">
                      <i className="bi bi-calendar me-1"></i>
                      {details?.patient?._createdAt ? new Date(details.patient._createdAt).toLocaleString() : "Not available"}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="fw-semibold text-muted">Resource Type</label>
                    <p className="mb-0">
                      <Badge bg="info">Patient</Badge>
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="fw-semibold text-muted">Database</label>
                    <p className="mb-0">
                      <Badge bg="success">MongoDB</Badge>
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="fw-semibold text-muted">Status</label>
                    <p className="mb-0">
                      <Badge bg="success">Active</Badge>
                    </p>
                  </div>
                </Col>
              </Row>

              {/* Disease Information */}
              {details?.patient?.disease_name && (
                <div className="border-top pt-3 mt-3">
                  <h6 className="fw-semibold mb-3">
                    <i className="bi bi-file-medical me-2"></i>
                    Disease Information
                  </h6>
                  
                  <div className="mb-3">
                    <label className="fw-semibold text-muted">Disease Name</label>
                    <p className="mb-0">{details.patient.disease_name}</p>
                  </div>
                </div>
              )}

              {/* Saved Conditions (FHIR) */}
              <div className="border-top pt-3 mt-3">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-bookmark-check me-2"></i>
                  Saved Conditions
                  <Badge bg="secondary" className="ms-2">{savedConditions.length}</Badge>
                </h6>
                {savedConditions.length === 0 ? (
                  <div className="text-muted">No saved conditions for this patient.</div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {savedConditions.map((cond, idx) => (
                      <Card key={cond.id || idx} className="border-0 shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <div className="fw-semibold">{cond?.code?.text || "Unnamed Condition"}</div>
                              <small className="text-muted">{cond?.id}</small>
                            </div>
                            <div className="d-flex gap-2">
                              {cond?.clinicalStatus?.coding?.[0]?.code && (
                                <Badge bg="success">{cond.clinicalStatus.coding[0].code}</Badge>
                              )}
                              {cond?.verificationStatus?.coding?.[0]?.code && (
                                <Badge bg="warning" text="dark">{cond.verificationStatus.coding[0].code}</Badge>
                              )}
                            </div>
                          </div>
                          {Array.isArray(cond?.code?.coding) && cond.code.coding.length > 0 && (
                            <Table striped bordered hover size="sm" className="mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th>System</th>
                                  <th>Code</th>
                                  <th>Display</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cond.code.coding.map((coding, cidx) => (
                                  <tr key={cidx}>
                                    <td><small className="font-monospace">{coding.system || ""}</small></td>
                                    <td><Badge bg="secondary" className="font-monospace">{coding.code || ""}</Badge></td>
                                    <td>{coding.display || ""}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Raw Data (Collapsible) */}
              <div className="border-top pt-3 mt-3">
                <details>
                  <summary className="fw-semibold cursor-pointer">
                    <i className="bi bi-code-square me-2"></i>
                    View Raw Data
                  </summary>
                  <pre className="mt-2 p-3 bg-dark text-light rounded" style={{ fontSize: '0.8rem', maxHeight: '300px', overflow: 'auto' }}>
                    {JSON.stringify(details?.patient, null, 2)}
                  </pre>
                </details>
              </div>
            </Card.Body>
          </Card>

          {/* Disease Codes 
          <div className="border rounded p-3 mb-4">
            <h6 className="fw-semibold mb-3"><i className="bi bi-upc-scan me-2"></i>Disease Codes</h6>
            {details?.codes ? (
              <Row className="mb-3">
                <Col md={4}>
                  <div><strong>NAMASTE:</strong> {details.codes?.namaste?.code || "—"}</div>
                  <div className="text-muted">{details.codes?.namaste?.display || ""}</div>
                </Col>
                <Col md={4}>
                  <div><strong>ICD11-TM2:</strong> {details.codes?.tm2?.code || "—"}</div>
                  <div className="text-muted">{details.codes?.tm2?.display || ""}</div>
                </Col>
                <Col md={4}>
                  <div><strong>ICD11-BIO:</strong> {details.codes?.biomed?.code || "—"}</div>
                  <div className="text-muted">{details.codes?.biomed?.display || ""}</div>
                </Col>
              </Row>
            ) : (
              <div className="text-muted mb-3">No disease codes set.</div>
            )}
            <Row className="g-2 align-items-end">
              <Col md={4}>
                <Form.Label>NAMASTE Code</Form.Label>
                <Form.Control value={codeInput} onChange={e => setCodeInput(e.target.value)} placeholder="e.g. NAM123" />
              </Col>
              <Col md={5}>
                <Form.Label>Disease Name (optional)</Form.Label>
                <Form.Control value={codeDiseaseName} onChange={e => setCodeDiseaseName(e.target.value)} placeholder="Disease name" />
              </Col>
              <Col md={3}>
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={loading || !selectedPatientId || !codeInput}
                  onClick={async () => {
                    if (!selectedPatientId || !codeInput) return;
                    try {
                      setLoading(true);
                      await fetch(`${API_BASE}/patients/${selectedPatientId}/codes`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ namaste_code: codeInput, disease_name: codeDiseaseName }),
                      });
                      await fetchDetails(selectedPatientId);
                    } catch (e) {
                      setError(e.message || "Failed to save codes");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <i className="bi bi-save me-1"></i>
                  Set Codes
                </Button>
              </Col>
            </Row>
          </div>*/}

          {/* 1. Diagnosis */}
          <div className="border rounded p-3 mb-4">
            <h6 className="fw-semibold mb-3"><i className="bi bi-clipboard2-pulse me-2"></i>Diagnosis</h6>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Earlier medicines taken</Form.Label>
                <Form.Control as="textarea" rows={2} value={diagForm.earlier_meds} onChange={e => setDiagForm({ ...diagForm, earlier_meds: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Current medicine names</Form.Label>
                <Form.Control as="textarea" rows={2} value={diagForm.current_meds} onChange={e => setDiagForm({ ...diagForm, current_meds: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Doctor names</Form.Label>
                <Form.Control value={diagForm.doctor_names} onChange={e => setDiagForm({ ...diagForm, doctor_names: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Hospital names</Form.Label>
                <Form.Control value={diagForm.hospital_names} onChange={e => setDiagForm({ ...diagForm, hospital_names: e.target.value })} />
              </Col>
            </Row>
            <div className="text-end">
              <Button variant="success" onClick={saveDiagnosis} disabled={loading || !isEditing}>
                <i className="bi bi-save me-1"></i>
                Save Diagnosis
              </Button>
            </div>
          </div>

          {/* 2. Treatment Advice */}
          <div className="border rounded p-3 mb-4">
            <h6 className="fw-semibold mb-3"><i className="bi bi-capsule-pill me-2"></i>Treatment Advice</h6>
            <div className="mb-3">
              <Button variant="outline-primary" size="sm" onClick={addTreatmentItem}>
                <i className="bi bi-plus-lg me-1"></i>
                Add Drug
              </Button>
            </div>
            {treatItems.length === 0 && (
              <div className="text-muted mb-3">No drugs added yet.</div>
            )}
            {treatItems.map((it, idx) => (
              <Row className="g-2 align-items-end mb-2" key={idx}>
                <Col md={3}>
                  <Form.Label>Drug</Form.Label>
                  <Form.Control value={it.drug} onChange={e => updateTreatmentItem(idx, 'drug', e.target.value)} />
                </Col>
                <Col md={3}>
                  <Form.Label>Dosage</Form.Label>
                  <Form.Control value={it.dosage} onChange={e => updateTreatmentItem(idx, 'dosage', e.target.value)} />
                </Col>
                <Col md={3}>
                  <Form.Label>Time</Form.Label>
                  <Form.Control value={it.time} onChange={e => updateTreatmentItem(idx, 'time', e.target.value)} />
                </Col>
                <Col md={2}>
                  <Form.Label>Remark</Form.Label>
                  <Form.Control value={it.remark} onChange={e => updateTreatmentItem(idx, 'remark', e.target.value)} />
                </Col>
                <Col md={1} className="text-end">
                  <Button variant="outline-danger" size="sm" onClick={() => removeTreatmentItem(idx)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </Col>
              </Row>
            ))}
            <div className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={2} value={treatNote} onChange={e => setTreatNote(e.target.value)} />
            </div>
            <div className="text-end">
              <Button variant="success" onClick={saveTreatment} disabled={loading || !isEditing}>
                <i className="bi bi-save me-1"></i>
                Save Treatment
              </Button>
            </div>
          </div>

          {/* 3. Service Summary */}
          <div className="border rounded p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-semibold mb-0"><i className="bi bi-ui-checks-grid me-2"></i>Service Summary</h6>
              <SpeakButton
                size="sm"
                label="Read Summary"
                text={[
                  `Patient: ${details?.patient?.name || "Unknown"}.`,
                  `Diagnosis — Earlier medicines: ${details?.diagnosis?.earlier_meds || "none"}.`,
                  `Current medicines: ${details?.diagnosis?.current_meds || "none"}.`,
                  `Doctors: ${details?.diagnosis?.doctor_names || "none"}.`,
                  `Hospitals: ${details?.diagnosis?.hospital_names || "none"}.`,
                  details?.treatment?.items?.length
                    ? `Treatment: ${details.treatment.items.map(i => `${i.drug} ${i.dosage} ${i.time}`).join(", ")}.`
                    : "No treatment advice added.",
                  details?.treatment?.note ? `Notes: ${details.treatment.note}` : "",
                ].filter(Boolean).join(" ")}
              />
            </div>
            <Row>
              <Col md={6}>
                <h6 className="text-muted">Diagnosis</h6>
                <ul className="mb-3">
                  <li><strong>Earlier meds:</strong> {details?.diagnosis?.earlier_meds || "—"}</li>
                  <li><strong>Current meds:</strong> {details?.diagnosis?.current_meds || "—"}</li>
                  <li><strong>Doctors:</strong> {details?.diagnosis?.doctor_names || "—"}</li>
                  <li><strong>Hospitals:</strong> {details?.diagnosis?.hospital_names || "—"}</li>
                </ul>
              </Col>
              <Col md={6}>
                <h6 className="text-muted">Treatment Advice</h6>
                {Array.isArray(details?.treatment?.items) && details.treatment.items.length > 0 ? (
                  <Table bordered size="sm">
                    <thead>
                      <tr>
                        <th>Drug</th>
                        <th>Dosage</th>
                        <th>Time</th>
                        <th>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.treatment.items.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.drug}</td>
                          <td>{it.dosage}</td>
                          <td>{it.time}</td>
                          <td>{it.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-muted">No treatment advice added.</div>
                )}
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>
    )}
    </>
  );
}

// ---------- Helpers ----------
function formatDateTime(ts) {
  if (!ts) return "Not available";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function extractName(item) {
  const n = item?.name;
  if (typeof n === "string" && n.trim()) return n.trim();
  if (n && typeof n === "object") {
    if (typeof n.text === "string" && n.text.trim()) return n.text.trim();
    const values = Object.values(n).filter((v) => typeof v === "string");
    if (values.length > 0) return values.join(" ").trim();
  }
  if (typeof item?.subject?.display === "string" && item.subject.display.trim()) return item.subject.display.trim();
  if (typeof item?.code?.text === "string" && item.code.text.trim()) return item.code.text.trim();
  if (typeof item?.title === "string" && item.title.trim()) return item.title.trim();
  return "Unknown Patient";
}

// ---------- FHIR Patients ----------
function ExistingFHIRPatients({ apiKey }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 200);

  const fetchSaves = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/saves`, { headers: { "x-api-key": apiKey } });
      if (!res.ok) throw new Error(`Failed to fetch saves (${res.status})`);
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchSaves();
    const id = setInterval(fetchSaves, 10000);
    return () => clearInterval(id);
  }, [fetchSaves]);

  const sortedPatients = useMemo(() => {
    const toTs = (item) => {
      const candidates = [
        item?.meta?.lastUpdated,
        item?.recordedDate,
        item?.date,
        item?._savedAt,
      ];
      for (const c of candidates) {
        if (c) {
          const d = new Date(c);
          if (!Number.isNaN(d.getTime())) return d.getTime();
        }
      }
      return 0;
    };
    return [...patients].sort((a, b) => toTs(b) - toTs(a));
  }, [patients]);

  const rows = useMemo(() => {
    return sortedPatients.map((item) => {
      const id = item?.id || item?.identifier?.[0]?.value || item?._id || "unknown";
      const name = extractName(item);
      const patientRef = item?.subject?.reference || item?.subject?.id || item?.patient?.reference || "Unknown";
      const ts = item?.meta?.lastUpdated || item?.recordedDate || item?.date || item?._savedAt || null;
      return { id, name, patientRef, ts, raw: item };
    });
  }, [sortedPatients]);

  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return rows;
    const q = debouncedSearch.toLowerCase();
    return rows.filter((r) => (r.name || "").toLowerCase().includes(q));
  }, [rows, debouncedSearch]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return rows.find((r) => r.id === selectedId) || null;
  }, [rows, selectedId]);

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="bi bi-people text-primary me-2"></i>
            <h5 className="mb-0">FHIR Patient Records</h5>
            <Badge bg="primary" className="ms-2">{rows.length}</Badge>
          </div>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={fetchSaves}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col lg={4}>
            <div className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <i className="bi bi-search me-1"></i>
                  Search Patients
                </Form.Label>
                <Form.Control
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by patient name..."
                />
              </Form.Group>
            </div>

            {loading && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading patients...</span>
              </div>
            )}

            {error && (
              <Alert variant="danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            {filteredRows.length === 0 && !loading ? (
              <div className="text-center py-4">
                <i className="bi bi-person-x display-4 text-muted mb-3"></i>
                <p className="text-muted">
                  {search ? "No patients found matching your search" : "No patients found"}
                </p>
              </div>
            ) : (
              <ListGroup>
                {filteredRows.map(r => (
                  <ListGroup.Item
                    key={r.id}
                    action
                    active={r.id === selectedId}
                    onClick={() => setSelectedId(r.id)}
                    className="d-flex justify-content-between align-items-start"
                  >
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">{r.name}</div>
                      <small className="text-muted">
                        ID: {r.id} • {r.patientRef}
                      </small>
                      {r.ts && (
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-clock me-1"></i>
                          {formatDateTime(r.ts)}
                        </div>
                      )}
                    </div>
                    <Badge bg="light" text="dark">
                      FHIR
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>

          <Col lg={8}>
            {selected ? (
              <Card className="border-0 bg-light">
                <Card.Header className="bg-white border-bottom">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person-circle text-primary me-2"></i>
                    <h6 className="mb-0">Patient Details</h6>
                    <Badge bg="primary" className="ms-2">
                      {selected.raw?.resourceType || "Condition"}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Patient ID</label>
                        <p className="mb-0">{selected.id}</p>
                      </div>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Patient Reference</label>
                        <p className="mb-0">{selected.patientRef}</p>
                      </div>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Last Updated</label>
                        <p className="mb-0">
                          <i className="bi bi-calendar me-1"></i>
                          {formatDateTime(selected.ts)}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Resource Type</label>
                        <p className="mb-0">
                          <Badge bg="info">{selected.raw?.resourceType || "Unknown"}</Badge>
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Clinical Status</label>
                        <p className="mb-0">
                          {selected.raw?.clinicalStatus?.coding?.[0]?.code ? (
                            <Badge bg="success">{selected.raw.clinicalStatus.coding[0].code}</Badge>
                          ) : (
                            <span className="text-muted">Not specified</span>
                          )}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Verification Status</label>
                        <p className="mb-0">
                          {selected.raw?.verificationStatus?.coding?.[0]?.code ? (
                            <Badge bg="warning" text="dark">{selected.raw.verificationStatus.coding[0].code}</Badge>
                          ) : (
                            <span className="text-muted">Not specified</span>
                          )}
                        </p>
                      </div>
                    </Col>
                  </Row>

                  {/* Condition Details */}
                  {selected.raw?.code && (
                    <div className="border-top pt-3 mt-3">
                      <h6 className="fw-semibold mb-3">
                        <i className="bi bi-file-medical me-2"></i>
                        Condition Information
                      </h6>
                      
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Condition Text</label>
                        <p className="mb-0">{selected.raw.code.text || "Not specified"}</p>
                      </div>

                      {selected.raw.code.coding && selected.raw.code.coding.length > 0 && (
                        <div>
                          <label className="fw-semibold text-muted mb-2">Coding Systems</label>
                          <Table striped bordered hover size="sm" className="mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>System</th>
                                <th>Code</th>
                                <th>Display</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selected.raw.code.coding.map((coding, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <small className="font-monospace">
                                      {coding.system || "Unknown"}
                                    </small>
                                  </td>
                                  <td>
                                    <Badge bg="secondary" className="font-monospace">
                                      {coding.code || "N/A"}
                                    </Badge>
                                  </td>
                                  <td>{coding.display || "Not specified"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category Information */}
                  {selected.raw?.category && (
                    <div className="border-top pt-3 mt-3">
                      <h6 className="fw-semibold mb-3">
                        <i className="bi bi-tags me-2"></i>
                        Category Information
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selected.raw.category.map((cat, idx) => (
                          <Badge key={idx} bg="light" text="dark">
                            {cat.coding?.[0]?.display || cat.coding?.[0]?.code || "Category"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Data (Collapsible) */}
                  <div className="border-top pt-3 mt-3">
                    <details>
                      <summary className="fw-semibold cursor-pointer">
                        <i className="bi bi-code-square me-2"></i>
                        View Raw Data
                      </summary>
                      <pre className="mt-2 p-3 bg-dark text-light rounded" style={{ fontSize: '0.8rem', maxHeight: '300px', overflow: 'auto' }}>
                        {JSON.stringify(selected.raw, null, 2)}
                      </pre>
                    </details>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-arrow-left-circle display-1 text-muted mb-3"></i>
                <h5 className="text-muted">Select a patient to view details</h5>
                <p className="text-muted">
                  Choose a patient from the list on the left to see their complete medical record information.
                </p>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

// ---------- Main Export ----------
export function MongoDashboard({ apiKey = "dev-key" }) {
  return (
    <Container fluid className="px-0">
      <MDBPatientsBlock apiKey={apiKey} />
    </Container>
  );
}

export function FHIRDashboard({ apiKey = "dev-key" }) {
  return (
    <Container fluid className="px-0">
      <ExistingFHIRPatients apiKey={apiKey} />
    </Container>
  );
}

export default function Patients({ apiKey = "dev-key" }) {
  return (
    <Container fluid className="px-0">
      <MDBPatientsBlock apiKey={apiKey} />
      <ExistingFHIRPatients apiKey={apiKey} />
    </Container>
  );
}
