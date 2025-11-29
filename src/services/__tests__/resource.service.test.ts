import { ResourceService } from "../resource.service";
import type { ResourceRepository } from "../../repositories";
import type {
  Resource,
  CreateResourceDto,
  UpdateResourceDto,
} from "../../types";

describe("ResourceService", () => {
  let resourceService: ResourceService;
  let mockRepository: jest.Mocked<ResourceRepository>;

  const mockResource: Resource = {
    id: "1",
    type: "oxygen",
    name: "Oxygen Supply",
    currentLevel: 5000,
    maxCapacity: 10000,
    unit: "kg",
    criticalThreshold: 20,
    warningThreshold: 40,
    consumptionRate: 100,
    lastUpdated: new Date(),
  };

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getHistory: jest.fn(),
    } as any;

    resourceService = new ResourceService(mockRepository);
  });

  describe("getAllResources", () => {
    it("should return all resources", async () => {
      const resources = [mockResource];
      mockRepository.findAll.mockResolvedValue(resources);

      const result = await resourceService.getAllResources();

      expect(result).toEqual(resources);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getResourceById", () => {
    it("should return a resource by id", async () => {
      mockRepository.findById.mockResolvedValue(mockResource);

      const result = await resourceService.getResourceById("1");

      expect(result).toEqual(mockResource);
      expect(mockRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should throw error when resource not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(resourceService.getResourceById("999")).rejects.toThrow(
        "Resource with id 999 not found"
      );
    });
  });

  describe("getResourceByType", () => {
    it("should return a resource by type", async () => {
      mockRepository.findByType.mockResolvedValue(mockResource);

      const result = await resourceService.getResourceByType("oxygen");

      expect(result).toEqual(mockResource);
      expect(mockRepository.findByType).toHaveBeenCalledWith("oxygen");
    });

    it("should throw error when resource type not found", async () => {
      mockRepository.findByType.mockResolvedValue(null);

      await expect(
        resourceService.getResourceByType("unknown")
      ).rejects.toThrow("Resource with type unknown not found");
    });
  });

  describe("createResource", () => {
    it("should create a new resource", async () => {
      const createDto: CreateResourceDto = {
        type: "water",
        name: "Water Supply",
        currentLevel: 3000,
        maxCapacity: 5000,
        unit: "L",
        criticalThreshold: 20,
        warningThreshold: 40,
      };

      mockRepository.create.mockResolvedValue({
        ...mockResource,
        ...createDto,
      });

      const result = await resourceService.createResource(createDto);

      expect(result).toMatchObject(createDto);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("updateResource", () => {
    it("should update an existing resource", async () => {
      const updateDto: UpdateResourceDto = { currentLevel: 6000 };
      const updatedResource = { ...mockResource, currentLevel: 6000 };

      mockRepository.update.mockResolvedValue(updatedResource);

      const result = await resourceService.updateResource("1", updateDto);

      expect(result.currentLevel).toBe(6000);
      expect(mockRepository.update).toHaveBeenCalledWith("1", updateDto);
    });

    it("should throw error when updating non-existent resource", async () => {
      mockRepository.update.mockResolvedValue(null);

      await expect(resourceService.updateResource("999", {})).rejects.toThrow(
        "Resource with id 999 not found"
      );
    });
  });

  describe("deleteResource", () => {
    it("should delete a resource", async () => {
      mockRepository.delete.mockResolvedValue(true);

      await resourceService.deleteResource("1");

      expect(mockRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should throw error when deleting non-existent resource", async () => {
      mockRepository.delete.mockResolvedValue(false);

      await expect(resourceService.deleteResource("999")).rejects.toThrow(
        "Resource with id 999 not found"
      );
    });
  });

  describe("getResourceStatus", () => {
    it("should return critical status when below critical threshold", () => {
      const criticalResource = { ...mockResource, currentLevel: 1500 };
      const status = resourceService.getResourceStatus(criticalResource);
      expect(status).toBe("critical");
    });

    it("should return warning status when below warning threshold", () => {
      const warningResource = { ...mockResource, currentLevel: 3500 };
      const status = resourceService.getResourceStatus(warningResource);
      expect(status).toBe("warning");
    });

    it("should return optimal status when above 80%", () => {
      const optimalResource = { ...mockResource, currentLevel: 8500 };
      const status = resourceService.getResourceStatus(optimalResource);
      expect(status).toBe("optimal");
    });

    it("should return normal status for mid-range levels", () => {
      const normalResource = { ...mockResource, currentLevel: 6000 };
      const status = resourceService.getResourceStatus(normalResource);
      expect(status).toBe("normal");
    });
  });

  describe("getResourceHistory", () => {
    it("should return resource history with limit", async () => {
      const mockHistory = [
        { timestamp: new Date(), level: 5000, action: "update" },
        { timestamp: new Date(), level: 4800, action: "consumption" },
      ];

      mockRepository.getHistory.mockResolvedValue(mockHistory as any);

      const result = await resourceService.getResourceHistory("1", 10);

      expect(result).toEqual(mockHistory);
      expect(mockRepository.getHistory).toHaveBeenCalledWith("1", 10);
    });
  });
});
