package com.medicocareai.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicocareai.backend.dto.clinic.ClinicResponse;
import com.medicocareai.backend.dto.clinic.CreateClinicRequest;
import com.medicocareai.backend.dto.clinic.UpdateClinicRequest;
import com.medicocareai.backend.entity.Clinic;
import com.medicocareai.backend.exception.BadRequestException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.ClinicRepository;

@Service
@Transactional
public class ClinicService {

    private final ClinicRepository clinicRepository;

    public ClinicService(ClinicRepository clinicRepository) {
        this.clinicRepository = clinicRepository;
    }

    public ClinicResponse createClinic(CreateClinicRequest request) {

        Clinic clinic = new Clinic();

        clinic.setName(request.getName());
        clinic.setAddressLine1(request.getAddressLine1());
        clinic.setAddressLine2(request.getAddressLine2());
        clinic.setCity(request.getCity());
        clinic.setPostcode(request.getPostcode());
        clinic.setPhoneNumber(request.getPhoneNumber());
        clinic.setEmail(request.getEmail());

        clinic.setActive(true);

        LocalDateTime now = LocalDateTime.now();

        clinic.setCreatedAt(now);
        clinic.setUpdatedAt(now);

        Clinic savedClinic = clinicRepository.save(clinic);

        return mapToResponse(savedClinic);
    }

    @Transactional(readOnly = true)
    public List<ClinicResponse> getAllActiveClinics() {

        return clinicRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClinicResponse getClinicById(UUID clinicId) {

        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Clinic not found"));

        if (!clinic.isActive()) {
            throw new ResourceNotFoundException("Clinic not found");
        }

        return mapToResponse(clinic);
    }

    @Transactional(readOnly = true)
    public List<ClinicResponse> getClinicsByCity(String city) {

        if (city == null || city.isBlank()) {
            throw new BadRequestException("City is required");
        }

        return clinicRepository.findByCityIgnoreCase(city.trim())
                .stream()
                .filter(Clinic::isActive)
                .map(this::mapToResponse)
                .toList();
    }

    public ClinicResponse updateClinic(
            UUID clinicId,
            UpdateClinicRequest request) {

        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Clinic not found"));

        if (!clinic.isActive()) {
            throw new ResourceNotFoundException("Clinic not found");
        }

        if (request.getName() != null) {
            clinic.setName(request.getName());
        }

        if (request.getAddressLine1() != null) {
            clinic.setAddressLine1(request.getAddressLine1());
        }

        if (request.getAddressLine2() != null) {
            clinic.setAddressLine2(request.getAddressLine2());
        }

        if (request.getCity() != null) {
            clinic.setCity(request.getCity());
        }

        if (request.getPostcode() != null) {
            clinic.setPostcode(request.getPostcode());
        }

        if (request.getPhoneNumber() != null) {
            clinic.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getEmail() != null) {
            clinic.setEmail(request.getEmail());
        }

        if (request.getActive() != null) {
            clinic.setActive(request.getActive());
        }

        clinic.setUpdatedAt(LocalDateTime.now());

        Clinic updatedClinic = clinicRepository.save(clinic);

        return mapToResponse(updatedClinic);
    }

    public void deactivateClinic(UUID clinicId) {

        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Clinic not found"));

        if (!clinic.isActive()) {
            throw new ResourceNotFoundException("Clinic not found");
        }

        clinic.setActive(false);
        clinic.setUpdatedAt(LocalDateTime.now());

        clinicRepository.save(clinic);
    }

    private ClinicResponse mapToResponse(Clinic clinic) {

        ClinicResponse response = new ClinicResponse();

        response.setId(clinic.getId());
        response.setName(clinic.getName());
        response.setAddressLine1(clinic.getAddressLine1());
        response.setAddressLine2(clinic.getAddressLine2());
        response.setCity(clinic.getCity());
        response.setPostcode(clinic.getPostcode());
        response.setPhoneNumber(clinic.getPhoneNumber());
        response.setEmail(clinic.getEmail());
        response.setActive(clinic.isActive());
        response.setCreatedAt(clinic.getCreatedAt());
        response.setUpdatedAt(clinic.getUpdatedAt());

        return response;
    }
}