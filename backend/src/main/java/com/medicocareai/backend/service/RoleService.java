package com.medicocareai.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.medicocareai.backend.entity.Role;
import com.medicocareai.backend.exception.ConflictException;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.RoleRepository;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository){
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<Role> getAllRoles(){
        return roleRepository.findAll();
    }

     @Transactional(readOnly = true)
    public Role getRoleById(UUID id){
        return roleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role not found : " + id));
    }

     @Transactional(readOnly = true)
    public Role getRoleByName(String name){
        return roleRepository.findByName(name).orElseThrow(() -> new ResourceNotFoundException("Role not found : " + name));
    }

    public Role createRole(String name, String description){
        if(roleRepository.existsByName(name)){
            throw new ConflictException("Role already exists : " + name);
        }

        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        return roleRepository.save(role);
    }
}
